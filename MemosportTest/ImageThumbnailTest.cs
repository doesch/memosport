using System.IO;
using Memosport.Classes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MemosportTest
{
    [TestClass]
    public class ImageThumbnailTest
    {
        // path to images: '/bin/Debug/TEstdata/uploads'
        private const string cPathToUploads = @"Testdata\uploads";

        // testfiles
        // Note: 'Copy Always' images on build.
        private const string cSourceFilenamePng = "5d675fbfaaca8ebb8ac69330900af12ed70f8a011.png";
        private const string cSourceFilenameJpg = "5d675fbfaaca8ebb8ac69330900af12ed70f8a012.jpg";
        private const string cSourceFilenameGif = "5d675fbfaaca8ebb8ac69330900af12ed70f8a013.gif";

        // full path to testfiles
        private readonly static string m_TargetFullPathPng = Path.Combine(cPathToUploads, $"{Path.GetFileNameWithoutExtension(cSourceFilenamePng)}_thumb{Path.GetExtension(cSourceFilenamePng)}");
        private readonly static string m_TargetFullPathJpg = Path.Combine(cPathToUploads, $"{Path.GetFileNameWithoutExtension(cSourceFilenameJpg)}_thumb{Path.GetExtension(cSourceFilenameJpg)}");
        private readonly static string m_TargetFullPathGif = Path.Combine(cPathToUploads, $"{Path.GetFileNameWithoutExtension(cSourceFilenameGif)}_thumb{Path.GetExtension(cSourceFilenameGif)}");

        [ClassCleanup]
        public static void Cleanup()
        {
            // cleanup files
            // Png
            if (File.Exists(m_TargetFullPathPng))
            {
                File.Delete(m_TargetFullPathPng);
            }
        }

        /// <summary> (Unit Test Method) resize image PNG. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        [TestMethod]
        public void ResizeImagePng()
        {
            // Arrange
            var lPathToPngSourceFile = Path.Combine(cPathToUploads, cSourceFilenamePng);

            // Act
            new ImageThumbnail().Create(lPathToPngSourceFile, m_TargetFullPathPng);

            // Assert
            Assert.IsTrue(File.Exists(m_TargetFullPathPng), $"Missing thumbnail {m_TargetFullPathPng}");
        }

        /// <summary> (Unit Test Method) resize image PNG. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        [TestMethod]
        public void ResizeImageJpg()
        {
            // Arrange
            var lPathToSourceFile = Path.Combine(cPathToUploads, cSourceFilenameJpg);

            // Act
            new ImageThumbnail().Create(lPathToSourceFile, m_TargetFullPathJpg);

            // Assert
            Assert.IsTrue(File.Exists(m_TargetFullPathJpg), $"Missing thumbnail {m_TargetFullPathJpg}");
        }

        /// <summary> (Unit Test Method) resize image Gif. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        [TestMethod]
        public void ResizeImageGif()
        {
            // Arrange
            var lPathToSourceFile = Path.Combine(cPathToUploads, cSourceFilenameGif);

            // Act
            new ImageThumbnail().Create(lPathToSourceFile, m_TargetFullPathGif);

            // Assert
            Assert.IsTrue(File.Exists(m_TargetFullPathGif), $"Missing thumbnail {m_TargetFullPathGif}");
        }
    }
}
