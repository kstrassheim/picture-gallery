using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace PictureGallery
{
    public class AngularConfig
    {
        private static string[] defaultPages = new string[] { "default", "home", "index" };
        private static string[] ignoreNavPrefixes = new string[] { "add", "edit", "view" };
        private static string[] idPagePrefixes = new string[] { "edit", "view" };

        private static string GetLastMatchingClassNameFromJsFile(string content)
        {
            string className = string.Empty;
            string strRegex = @"^.*exports\.[\w|\d]*\s=\s[\w|\d]*;";
            Regex myRegex = new Regex(strRegex, RegexOptions.Multiline);
            MatchCollection matches = myRegex.Matches(content);
            if (matches.Count < 1) return className;
            foreach (Match myMatch in myRegex.Matches(content))
                if (myMatch.Success) className = myMatch.ToString();
            string[] split = className.Split('.', '=');
            if (split.Length == 3) className = split[2].TrimEnd(';').TrimStart();
            return className;
        }

        private static void AppendConfigSettingsOfFiles<T>(string currentPath, string currentRelativePath, Action<T, string, string, string> setAction, List<T> configSettings) where T : ConfigSetting, new()
        {
            string[] files = Directory.GetFiles(currentPath);
            foreach (string fabs in files)
            {
                // If not js file go on
                if (Path.GetExtension(fabs) != ".js") continue;
                string f = Path.GetFileNameWithoutExtension(fabs);
                string content = File.ReadAllText(fabs);
                string className = GetLastMatchingClassNameFromJsFile(content);
                T item = new T();

                item.path = currentRelativePath + "/" + f + Path.GetExtension(fabs);
                item.className = !string.IsNullOrEmpty(className) ? className : f;
                item.bindName = className;

                if (setAction != null) setAction(item, currentRelativePath, f, className);
                configSettings.Add(item);
            }
            string[] dirs = Directory.GetDirectories(currentPath);
            foreach (string dirabs in dirs)
            {
                string dir = dirabs.Split(Path.DirectorySeparatorChar).Last();
                string newCurrentPath = currentPath + "\\" + dir;
                string newCurrentRelativePath = currentRelativePath + "/" + dir;
                // Recursive call
                AppendConfigSettingsOfFiles(newCurrentPath, newCurrentRelativePath, setAction, configSettings);
            }
            // recursive anchor
            return;
        }

        public static string GetConfig(string relativeAngularRootPath = "~/App")
        {
            string root = HttpContext.Current.Server.MapPath(relativeAngularRootPath);
            string relativePath = relativeAngularRootPath.TrimStart('~');
            Config cs = new Config();
            cs.appName = relativePath.TrimStart('/').ToLower();
            string subdir = "controllers";
            AppendConfigSettingsOfFiles<Page>(root + "\\" + subdir, relativePath + "/" + subdir, delegate (Page p, string path, string file, string className)
            {
                bool isIdPage = idPagePrefixes.FirstOrDefault(i => file.StartsWith(i)) != null;
                bool ignoreNav = ignoreNavPrefixes.FirstOrDefault(i => file.StartsWith(i)) != null;
                // TODO Read content of ts file to get Real Class Name for Display Name
                p.title = className;
                p.isDefault = defaultPages.Contains(file);
                p.bindName = p.bindName + "Ctrl";
                p.url = path.Replace(relativePath + "/" + subdir, "") + "/" + file + (isIdPage ? "/:id" : string.Empty);
                p.templateUrl = path + "/" + file + ".html";
                //if(p.isDefault) p.url = "";
                p.nav = !ignoreNav;
                p.order = p.isDefault ? 0 : 1;
            }, cs.pages);
            subdir = "directives";
            AppendConfigSettingsOfFiles<ConfigSetting>(root + "\\" + subdir, relativePath + "/" + subdir, delegate (ConfigSetting c, string file, string path, string className)
            {
                c.bindName = c.bindName.ToLower();
            }, cs.directives);
            subdir = "services";
            AppendConfigSettingsOfFiles<ConfigSetting>(root + "\\" + subdir, relativePath + "/" + subdir, null, cs.services);

            string json = "<script type='text/javascript'>var config = " + new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(cs) + ";</script>";
            return json;
        }

        #region nested types

        internal class ConfigSetting
        {
            public string bindName;
            public string path;
            public string className;
        }

        internal class Page : ConfigSetting
        {
            public string title;
            public bool isDefault;
            public string url;
            public string templateUrl;
            public bool nav;
            public int order;
        }

        internal class Config
        {
            public string appName;
            public List<Page> pages = new List<Page>();
            public List<ConfigSetting> directives = new List<ConfigSetting>();
            public List<ConfigSetting> services = new List<ConfigSetting>();
        }

        #endregion nested types
    }
}