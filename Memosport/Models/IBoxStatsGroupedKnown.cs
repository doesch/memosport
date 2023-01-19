namespace Memosport.Models
{
    /// <summary>
    /// grouped known value for stats
    /// </summary>
    public interface IBoxStatsGroupedKnown
    {
        /// <summary>
        /// how often known
        /// </summary>
        public int Known { get; set; }

        /// <summary>
        /// count all index cards in box which have the same known value
        /// </summary>
        public int Count { get; set; }
    }
}
