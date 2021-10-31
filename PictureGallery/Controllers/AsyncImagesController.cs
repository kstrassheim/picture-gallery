using Microsoft.AspNet.SignalR;
using PictureGallery.ClientNotification;
using PictureGallery.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;

namespace PictureGallery.Controllers
{
    /// <summary>
    /// The async Images REST compatible controller
    /// </summary>
    public class AsyncImagesController : ApiController
    {
        #region fields

        private PictureGalleryContext db = new PictureGalleryContext();

        #endregion fields

        #region controller methods

        public async Task<List<Image>> Get(string subscriptionId, string hubClientId, int id)
        {
            AsyncRestQuery<int> get = new AsyncRestQuery<int>(subscriptionId, hubClientId);
            var sel = db.Images.Include("File").Include("Render");
            var query = id > 0 ? db.Images.Include("File").Include("Render").Where(i => i.Id == id).ToListAsync() : db.Images.Include("File").Include("Render").ToListAsync();
            // NOTIFY Client that get List operation started if client id is provided
            get.SendNotification<Notification>(50);
            return await query;
        }

        // PUT: api/AsyncImages/5
        public async Task<IHttpActionResult> Put(AsyncRestQuery<Image> put)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (put.item.Id < 0) return BadRequest();

            db.Entry(put.item).State = EntityState.Modified;
            if (put.item.File != null) db.Entry(put.item.File).State = EntityState.Modified;
            Task<int> res;
            try { res = db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!ImageExists(put.item.Id)) return NotFound();
                else throw;
            }
            await res;
            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/AsyncImages
        public async Task<IHttpActionResult> Post(AsyncAddQuery post)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!bool.Parse(ConfigurationManager.AppSettings["IsDemo"]))
            {
                int i = 0;
                foreach (Image img in post.item)
                {
                    int tempId = img.Id;
                    db.Images.Add(img);
                    var wait = db.SaveChangesAsync();
                    // Send status notification
                    post.SendNotification<Notification>(i / post.item.Count() * 100);
                    await wait;

                    // send replacing ids to sender
                    post.SendRealtimeAdd(tempId, img.Id, img.RenderId);
                }
                return CreatedAtRoute("DefaultApi", new { id = 0 }, post.item);
            }
            else
            {
                return Ok(post);
            }
        }

        // DELETE: api/AsyncImages/5
        public async Task<IHttpActionResult> Delete(AsyncRestQuery<int> del)
        {
            // AsyncRestQuery<int> del = new AsyncRestQuery<int>(subscriptionId, hubClientId);
            if (!bool.Parse(ConfigurationManager.AppSettings["IsDemo"]))
            {
                Image image = db.Images.Find(del.item);
                if (image == null) return NotFound();
                db.Images.Remove(image);
                var res = db.SaveChangesAsync();
                await res;
                return Ok(image);

            }
            else
            {
                return Ok(del);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ImageExists(int id)
        {
            return db.Images.Count(e => e.Id == id) > 0;
        }

        #endregion controller methods

        #region nested types

        /// <summary>
        /// A helper class to allow rest posts with notification client parameters
        /// </summary>
        /// <typeparam name="T"></typeparam>
        public class AsyncRestQuery<T>
        {
            public T item { get; set; }
            public string subscriptionId { get; set; }
            public string hubClientId { get; set; }

            public bool IsNotifcationValid()
            {
                Guid guid;
                return !string.IsNullOrEmpty(this.hubClientId) && Guid.TryParse(this.hubClientId, out guid) && !string.IsNullOrEmpty(this.subscriptionId) && Guid.TryParse(this.subscriptionId, out guid);
            }

            public void SendNotification<HubType>(dynamic data) where HubType : Microsoft.AspNet.SignalR.Hubs.IHub
            {
                try
                {
                    IHubContext n = GlobalHost.ConnectionManager.GetHubContext<HubType>();
                    if (this.IsNotifcationValid()) n.Clients.Client(this.hubClientId).receive(this.subscriptionId, data);
                    n.Clients.Client(this.hubClientId).replaceids(1);
                }
                catch { }
            }

            public AsyncRestQuery() { }
            public AsyncRestQuery(string subscriptionId, string hubClientId) { this.subscriptionId = subscriptionId; this.hubClientId = hubClientId; }
        }

        /// <summary>
        /// A helper query class that also stores an added callback id to replace ids on add
        /// </summary>
        public class AsyncAddQuery : AsyncRestQuery<Collection<Image>>
        {
            public string addedGuid { get; set; }
            public bool IsAddedGuidValid()
            {
                Guid guid;
                return !string.IsNullOrEmpty(this.addedGuid) && Guid.TryParse(this.addedGuid, out guid);
            }

            public void SendRealtimeAdd(int tempId, int imageId, int renderId)
            {
                try
                {
                    IHubContext n = GlobalHost.ConnectionManager.GetHubContext<Notification>();
                    if (this.IsAddedGuidValid())
                    {
                        n.Clients.Client(this.hubClientId).addedReceive(this.addedGuid, tempId, imageId, renderId);
                        n.Clients.AllExcept(this.hubClientId).added(imageId);
                    }
                }
                catch { }
            }
        }

        #endregion nested types
    }
}