using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Exceptions
{
    using System;

    public class FileSizeException : Exception
    {
        public FileSizeException()
        {
        }

        public FileSizeException(string message)
            : base(message)
        {
        }

        public FileSizeException(string message, Exception inner)
            : base(message, inner)
        {
        }
    }
}
