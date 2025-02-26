namespace DataAccessLayer.Entity.Base
{
    public class EntityBase
    {
        public Guid ID { get; set; } 
        public string? CreateBy { get; set; } 
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set;} = DateTime.UtcNow;
        public string? DeleteBy { get; set; }
        public DateTime? DeleteDate { get; set; } = DateTime.UtcNow;
        public int Status { get; set; }
    }
}
