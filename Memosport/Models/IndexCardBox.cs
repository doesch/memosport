using Memosport.Classes;
using Memosport.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Memosport.Models
{
    public class IndexCardBox
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; }

        public DateTime Created { get; set; }

        public DateTime Modified { get; set; }

        //public string Dalyreminder { get; set; }

        //public string Monthlyreminder { get; set; }

        /// <summary>
        /// Checks if user is owner of index card box
        /// </summary>
        /// <param name="pIndexCard"></param>
        /// <param name="pCurrentUser"></param>
        /// <param name="pContext"></param>
        /// <returns></returns>
        public static bool UserIsOwnerOfIndexCardBox(int pIndexCardBoxId, User pCurrentUser, MemosportContext pContext)
        {
            var lResult = true;
            
            var lIndexCardBox = pContext.IndexCardBoxes.SingleOrDefault(x => x.Id == pIndexCardBoxId);

            if (lIndexCardBox == null)
            {
                lResult = false;
            }
            else
            {
                lResult = lIndexCardBox.UserId == pCurrentUser.Id;

                // detach
                pContext.Entry(lIndexCardBox).State = EntityState.Detached;
            }

            return lResult;
        }
    }
}