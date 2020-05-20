using System;
using System.Collections.Generic;
using System.Linq;

namespace rcl
{
    public class WeatherForecastService
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        static Random random = new Random(100);
        private static readonly List<WeatherForecast> forecasts = Enumerable.Range(1, 5000).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = random.Next(-20, 55),
            Summary = Summaries[random.Next(Summaries.Length)]
        }).ToList();


        public IEnumerable<WeatherForecast> GetForecasts(int numberOfRecords)
        {
            return forecasts.Take(numberOfRecords).OrderBy(_ => random.Next());
        }
    }
}
