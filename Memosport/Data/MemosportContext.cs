using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Memosport.Models;

namespace Memosport.Data
{
    public class MemosportContext : DbContext
    {
        public MemosportContext(DbContextOptions<MemosportContext> options)

            : base(options)

        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<IndexCardBox> IndexCardBoxes { get; set; }
        public DbSet<IndexCard> IndexCards { get; set; }
    }
}
