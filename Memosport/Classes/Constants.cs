using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Classes
{
    public static class Constants
    {
        /// <summary> (Immutable) the authentication expire in days. </summary>
        public const int AuthExpireInDays = 365;

        // number of repetitions till the index card disappears from stack
        public const int Repetitions = 3;
    }
}
