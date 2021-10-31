using System.Web.Optimization;

namespace PictureGallery
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/Scripts/vendor")
                        .Include("~/Scripts/jquery-{version}.js")
                        .Include("~/Scripts/jquery-ui.js")
                        // touch punch is only required for google chrome support
                        .Include("~/Scripts/jquery.ui.touch-punch.js")
                        // touch event libs
                        .Include("~/Scripts/jquery.touchy.js")
                        // realtime client
                        .Include("~/Scripts/jquery.signalR-{version}.js")
                        .Include("~/Scripts/require.js")
                        .Include("~/Scripts/angular.js")
                        .Include("~/Scripts/angular-route.js")
                        .Include("~/Scripts/angular-resource.js")
                        //.Include("~/Scripts/modernizr-*")
                        .Include("~/Scripts/bootstrap.js")
                        .Include("~/Scripts/respond.js"));


            bundles.Add(new ScriptBundle("~/Scripts/app")
                .Include("~/App/app.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/jquery-ui.css",
                      "~/Content/site.css"
                      ));

            // Set EnableOptimizations to false for debugging. For more information,
            // visit http://go.microsoft.com/fwlink/?LinkId=301862
            BundleTable.EnableOptimizations = false;
        }
    }
}
