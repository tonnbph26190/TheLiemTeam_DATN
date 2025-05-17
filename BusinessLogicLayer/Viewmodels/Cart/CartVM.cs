using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessLogicLayer.Viewmodels.CartOptions;

namespace BusinessLogicLayer.Viewmodels.Cart
{
    public class CartVM
    {
        public string ID { get; set; }
        public string? Description { get; set; }
        public string? IDUser { get; set; }
        public int Status { get; set; }
        public List<CartOptionsVM> CartOptions { get; set; } = new List<CartOptionsVM>();
    }
}
