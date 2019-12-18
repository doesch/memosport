using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Memosport.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Memosport.Classes
{
    public class Upload
    {
        // the upload folder in wwwroot
        private const string cUploadFolder = "uploads";

        // the maximum file size of uploaded data in bytes
        private const double cMaxFileSize = 5242880; // 5MB

        /// <summary> List of types of the valid images. </summary>
        private static readonly List<string> cValidImageTypes = new List<string>
        {
            ".jpg", ".gif", ".png"
        };

        // only one valid audio type
        private const string cValidAudioType = ".mp3";

        /// <summary> Saves an uploaded image file. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pImageFile">   The file. </param>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        /// <returns> True if it succeeds, false if it fails. </returns>
        public static async Task SaveImageFile(IFormFile pImageFile, string pWebRootPath)
        {
            if (pImageFile.Length > 0)
            {
                ValidateSize(pImageFile);
                ValidateImageType(pImageFile);

                // create full path for file
                var lFullPath = CreateFullPath(pImageFile, pWebRootPath);

                using (var lStream = System.IO.File.Create(lFullPath))
                {
                    await pImageFile.CopyToAsync(lStream);
                }
            }
        }

        /// <summary> Saves an audio file. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pAudioFile">   The audio file. </param>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        /// <returns> An asynchronous result. </returns>
        internal static async Task SaveAudioFile(IFormFile pAudioFile, string pWebRootPath)
        {
            if (pAudioFile.Length > 0)
            {
                ValidateSize(pAudioFile);
                ValidateAudioType(pAudioFile);

                // create full path for file
                var lFullPath = CreateFullPath(pAudioFile, pWebRootPath);

                using (var lStream = System.IO.File.Create(lFullPath))
                {
                    await pAudioFile.CopyToAsync(lStream);
                }
            }
        }
        /// <summary> Deletes the file. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pFilename">    Filename of the file. </param>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        internal static void DeleteFile(string pFilename, string pWebRootPath)
        {
            // do nothing when filename not exists
            if (String.IsNullOrEmpty(pFilename))
            {
                return;
            }

            // create full path
            var lFullPath = Path.Combine(pWebRootPath, cUploadFolder, pFilename);

            if (File.Exists(lFullPath))
            {
                File.Delete(lFullPath);
            }
        }

        /// <summary> Validates the size described by pFormFile. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pFormFile"> The form file. </param>
        private static void ValidateSize(IFormFile pFormFile)
        {
            if (pFormFile.Length > cMaxFileSize)
            {
                throw new FileSizeException();
            }
        }

        /// <summary> Creates full path with random filename </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pFile">        The file. </param>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        /// <returns> The new full path. </returns>
        private static string CreateFullPath(IFormFile pFile, string pWebRootPath)
        {
            // create guid for filename
            var lNewFilename = Guid.NewGuid().ToString().Replace("-", "");

            // append suffix
            var lSuffix = Path.GetExtension(pFile.FileName).ToLowerInvariant();
            lNewFilename += lSuffix;

            return Path.Combine(pWebRootPath, cUploadFolder, lNewFilename);
        }

        /// <summary> Validates the image type described by pImageFile. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pImageFile"> The file. </param>
        private static void ValidateImageType(IFormFile pImageFile)
        {
            var lExtension = Path.GetExtension(pImageFile.FileName).ToLowerInvariant();

            if (cValidImageTypes.Any(x => x == lExtension) == false)
            {
                throw new InvalidFileTypeException();
            }
        }

        /// <summary> Validates the audio type described by pAudioFile. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pAudioFile"> The audio file. </param>
        private static void ValidateAudioType(IFormFile pAudioFile)
        {
            if (Path.GetExtension(pAudioFile.FileName).ToLowerInvariant() != cValidAudioType)
            {
                throw new InvalidFileTypeException();
            }
        }
    }
}
