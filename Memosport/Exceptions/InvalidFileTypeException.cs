using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Exceptions
{
    using System;

    public class InvalidFileTypeException : Exception
    {
        public InvalidFileTypeException()
        {
        }

        public InvalidFileTypeException(string message)
            : base(message)
        {
        }

        public InvalidFileTypeException(string message, Exception inner)
            : base(message, inner)
        {
        }
    }
}
