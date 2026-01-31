using ExamFlowWebApi.Entities;
using ExamFlowWebApi.Helpers;
using ExamFlowWebApi.Repositories.Implementations;
using ExamFlowWebApi.Repositories.Interfaces;
using ExamFlowWebApi.Services.Implementations;
using ExamFlowWebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------- SERVICES --------------------

builder.Services.AddControllers();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new Exception("Database connection string missing")
    )
);

builder.Services.AddScoped<IUserRespository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentProfileService, StudentProfileService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IHallTicketService, HallTicketService>();
builder.Services.AddSingleton<JwtTokenGenerator>();
builder.Services.AddScoped<PasswordService>();

// -------------------- JWT CONFIG --------------------

var jwtSection = builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSection["Key"]
    ?? throw new Exception("JWT Key is missing in appsettings.json");

var jwtIssuer = jwtSection["Issuer"]
    ?? throw new Exception("JWT Issuer is missing in appsettings.json");

var jwtAudience = jwtSection["Audience"]
    ?? throw new Exception("JWT Audience is missing in appsettings.json");

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});

builder.Services.AddAuthorization();

// -------------------- CORS --------------------

var frontendUrl = builder.Configuration.GetSection("AppSettings")["FrontendUrl"] 
    ?? "http://localhost:4200";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
    );
});

// -------------------- SWAGGER --------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -------------------- PIPELINE --------------------

app.UseCors("AllowAngular");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
