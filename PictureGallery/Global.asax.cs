using PictureGallery.Models;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace PictureGallery
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
#if DEBUG
            PictureGalleryContext con = new PictureGalleryContext();
            if (!con.Database.Exists())
            {
                con.Database.Initialize(true);
            }
#endif

            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
