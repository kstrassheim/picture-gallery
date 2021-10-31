using System.Data.Entity;

namespace PictureGallery.Models
{
    public class PictureGalleryContext : DbContext
    {
        public DbSet<Image> Images { get; set; }

        public DbSet<File> Files { get; set; }

        public DbSet<Render> Renders { get; set; }

        public PictureGalleryContext()
            : base("PictureGalleryContext")
        {

        }
    }
}