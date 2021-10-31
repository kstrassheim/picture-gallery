namespace PictureGallery.Models
{
    public class File
    {
        public int Id { get; set; }
        public string FileInfo { get; set; }
        public byte[] Data { get; set; }
    }
}