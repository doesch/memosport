using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Data
{
    public class MemosportContext : DbContext
    {
        public MemosportContext(DbContextOptions<MemosportContext> options)

            : base(options)

        {

        }

        public DbSet<Memosport.Models.User> Users { get; set; }
    }
}
