using System.ComponentModel.DataAnnotations;

namespace PictureGallery.Models
{
    /// <summary>
    /// A simple image
    /// </summary>
    public class Image : BaseItem
    {
        public int Id { get; set; }
        public string Title { get; set; }

        [MaxLength(10)]
        public string Color { get; set; }

        public int FileId { get; set; }
        public virtual File File { get; set; }

        public int RenderId { get; set; }
        public virtual Render Render { get; set; }
    }
}