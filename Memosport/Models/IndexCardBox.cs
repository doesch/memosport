using Memosport.Classes;
using Memosport.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Memosport.Models
{
    public class IndexCardBox : IIndexCardBox
    {
        public int? Id { get; set; }

        public int? UserId { get; set; }

        public string Name { get; set; }

        public bool Archived { get; set; }

        // the UTC-time when the user has lastly learned this box.
        public DateTime? DateLastLearned { get; set; }

        // calculate the days when last learned the box. Reference is the Date in property 'DateLastLearned'
        [NotMapped]
        public int? DateLastLearnedDays {
            get
            {
                if (DateLastLearned == null)
                {
                    return null;
                }

                // calculate the timespan
                var lTimeSpan = DateTime.UtcNow.Subtract((DateTime) DateLastLearned);

                // we can keep the UTC because we calculate an timespan only.
                return lTimeSpan.Days;
            }
        }

        [NotMapped]
        public IBoxStats BoxStats { get; set; }

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
        public static bool UserIsOwnerOfIndexCardBox(int pIndexCardBoxId, IUser pCurrentUser, MemosportContext pContext)
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