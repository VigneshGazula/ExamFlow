using Microsoft.AspNetCore.Mvc;

namespace ExamFlowWebApi.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
