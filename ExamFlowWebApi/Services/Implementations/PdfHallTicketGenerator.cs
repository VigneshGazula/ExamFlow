using ExamFlowWebApi.DTO.HallTicket;
using PuppeteerSharp;
using PuppeteerSharp.Media;

namespace ExamFlowWebApi.Services.Implementations
{
    public class PdfHallTicketGenerator
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<PdfHallTicketGenerator> _logger;
        private static bool _browserFetched = false;
        private static readonly SemaphoreSlim _browserFetchLock = new SemaphoreSlim(1, 1);

        public PdfHallTicketGenerator(
            IWebHostEnvironment environment, 
            ILogger<PdfHallTicketGenerator> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<byte[]> GenerateHallTicketPdf(HallTicketDownloadDTO hallTicketData)
        {
            try
            {
                _logger.LogInformation("Starting PDF generation for hall ticket: {HallTicketNumber}", hallTicketData.HallTicketNumber);

                // Ensure browser is downloaded (only once)
                await EnsureBrowserDownloadedAsync();

                // Read the HTML template
                var templatePath = Path.Combine(_environment.ContentRootPath, "hallticket-html", "hallticket.html");
                
                if (!File.Exists(templatePath))
                {
                    _logger.LogError("HTML template not found at: {TemplatePath}", templatePath);
                    throw new FileNotFoundException("Hall ticket HTML template not found", templatePath);
                }

                var htmlContent = await File.ReadAllTextAsync(templatePath);

                // Replace placeholders with actual data
                htmlContent = ReplacePlaceholders(htmlContent, hallTicketData);

                // Handle logo - convert to base64 if exists
                htmlContent = await EmbedLogoAsync(htmlContent);

                // Convert HTML to PDF using Puppeteer
                var launchOptions = new LaunchOptions
                {
                    Headless = true,
                    Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
                };

                await using var browser = await Puppeteer.LaunchAsync(launchOptions);
                await using var page = await browser.NewPageAsync();

                // Set content (no need to wait for network since everything is embedded)
                await page.SetContentAsync(htmlContent, new NavigationOptions
                {
                    WaitUntil = new[] { WaitUntilNavigation.DOMContentLoaded },
                    Timeout = 60000 // 60 seconds timeout
                });

                // Generate PDF
                var pdfBytes = await page.PdfDataAsync(new PdfOptions
                {
                    Format = PaperFormat.A4,
                    PrintBackground = true,
                    MarginOptions = new MarginOptions
                    {
                        Top = "0",
                        Right = "0",
                        Bottom = "0",
                        Left = "0"
                    }
                });

                _logger.LogInformation("PDF generation completed successfully for hall ticket: {HallTicketNumber}", hallTicketData.HallTicketNumber);

                return pdfBytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF for hall ticket: {HallTicketNumber}. Error: {ErrorMessage}", 
                    hallTicketData?.HallTicketNumber ?? "Unknown", ex.Message);
                throw new Exception($"Failed to generate hall ticket PDF: {ex.Message}", ex);
            }
        }

        private async Task EnsureBrowserDownloadedAsync()
        {
            if (_browserFetched) return;

            await _browserFetchLock.WaitAsync();
            try
            {
                if (!_browserFetched)
                {
                    _logger.LogInformation("Downloading Chromium browser for PDF generation...");
                    var browserFetcher = new BrowserFetcher();
                    await browserFetcher.DownloadAsync();
                    _browserFetched = true;
                    _logger.LogInformation("Chromium browser downloaded successfully");
                }
            }
            finally
            {
                _browserFetchLock.Release();
            }
        }

        private string ReplacePlaceholders(string htmlContent, HallTicketDownloadDTO data)
        {
            // Replace exam series and department information
            htmlContent = htmlContent.Replace("{{EXAM_SERIES_NAME}}", data.ExamSeriesName.ToUpper());
            htmlContent = htmlContent.Replace("{{DEPARTMENT}}", data.Department);
            
            // Replace student information
            htmlContent = htmlContent.Replace("{{HALL_TICKET_NO}}", data.HallTicketNumber);
            htmlContent = htmlContent.Replace("{{STUDENT_NAME}}", data.StudentName);

            // Build dynamic exam rows based on actual exam count
            var examRowsHtml = BuildExamRows(data.ExamSchedule);
            
            // Replace the exam table body
            // Find and replace the tbody section
            var tbodyStart = htmlContent.IndexOf("<tbody>");
            var tbodyEnd = htmlContent.IndexOf("</tbody>") + 8; // +8 for "</tbody>"
            
            if (tbodyStart >= 0 && tbodyEnd > tbodyStart)
            {
                var beforeTbody = htmlContent.Substring(0, tbodyStart);
                var afterTbody = htmlContent.Substring(tbodyEnd);
                htmlContent = beforeTbody + "<tbody>" + examRowsHtml + "</tbody>" + afterTbody;
            }

            return htmlContent;
        }

        private string BuildExamRows(List<ExamScheduleDTO> exams)
        {
            var rowsHtml = new System.Text.StringBuilder();
            
            foreach (var exam in exams)
            {
                rowsHtml.Append($@"
                        <tr>
                            <td>{exam.ExamDate:dd/MM/yyyy}</td>
                            <td>{exam.ExamTime}</td>
                            <td>{exam.SubjectCode}</td>
                            <td>{exam.SubjectName}</td>
                        </tr>");
            }

            return rowsHtml.ToString();
        }

        private async Task<string> EmbedLogoAsync(string htmlContent)
        {
            try
            {
                var logoPath = Path.Combine(_environment.ContentRootPath, "hallticket-html", "mlrit_logo.png");
                
                if (File.Exists(logoPath))
                {
                    var logoBytes = await File.ReadAllBytesAsync(logoPath);
                    var base64Logo = Convert.ToBase64String(logoBytes);
                    var dataUri = $"data:image/png;base64,{base64Logo}";
                    
                    // Replace logo src with base64 data URI
                    htmlContent = htmlContent.Replace("src=\"mlrit_logo.png\"", $"src=\"{dataUri}\"");
                    
                    _logger.LogInformation("Logo embedded successfully");
                }
                else
                {
                    _logger.LogWarning("Logo file not found at: {LogoPath}", logoPath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to embed logo: {Message}", ex.Message);
            }

            return htmlContent;
        }
    }
}
