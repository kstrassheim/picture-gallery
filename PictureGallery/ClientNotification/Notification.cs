using Microsoft.AspNet.SignalR;
using PictureGallery.Models;
using System.Configuration;
using System.Data.Entity;

namespace PictureGallery.ClientNotification
{
    public class Notification : Hub
    {
        private PictureGalleryContext db = new PictureGalleryContext();

        public void UpdateRender(int Id, int ZIndex, int Width, int Top, int Left)
        {
            Render render = new Render() { Id = Id, ZIndex = ZIndex, Width = Width, Top = Top, Left = Left };
            this.db.Entry(render).State = EntityState.Modified;//.Where(r => r.Id == r.Id).FirstOrDefault();
            var save = this.db.SaveChanges();
            this.Clients.Others.updated(Id, ZIndex, Width, Top, Left);
        }

        public void DeleteItem(int imageId)
        {
            if (!bool.Parse(ConfigurationManager.AppSettings["IsDemo"]))
            {
                this.db.Images.Remove(this.db.Images.Find(imageId));
                this.db.SaveChanges();
                this.Clients.Others.deleted(imageId);
            }
        }
    }
}