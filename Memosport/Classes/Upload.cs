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
        public static async Task<string> SaveImageFile(IFormFile pImageFile, string pWebRootPath)
        {
            ValidateSize(pImageFile);
            ValidateImageType(pImageFile);

            // create filename
            var lNewFilename = CreateFileName(pImageFile.FileName, pWebRootPath);
            var lFullPath = Path.Combine(pWebRootPath, cUploadFolder, lNewFilename);

            using (var lStream = System.IO.File.Create(lFullPath))
            {
                await pImageFile.CopyToAsync(lStream);
            }

            return lNewFilename;
        }

        /// <summary> Copies the file. </summary>
        /// <remarks> Doetsch, 15.01.20. </remarks>
        /// <param name="pOriginalFilename"> The file. </param>
        /// <param name="pWebRootPath">      Full pathname of the web root file. </param>
        /// <returns> An asynchronous result that yields a string. </returns>
        public static async Task<string> CopyFile(string pOriginalFilename, string pWebRootPath)
        {
            // create filename
            var lNewFilename = CreateFileName(pOriginalFilename, pWebRootPath);
            var lTargetFullPath = Path.Combine(pWebRootPath, cUploadFolder, lNewFilename);

            var lOriginalFullPath = Path.Combine(pWebRootPath, cUploadFolder, pOriginalFilename);

            File.Copy(lOriginalFullPath, lTargetFullPath);

            return lNewFilename;
        }

        /// <summary> Saves an audio file. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pAudioFile">   The audio file. </param>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        /// <returns> An asynchronous result. </returns>
        internal static async Task<string> SaveAudioFile(IFormFile pAudioFile, string pWebRootPath)
        {
            ValidateSize(pAudioFile);
            ValidateAudioType(pAudioFile);

            // create filename
            var lNewFilename = CreateFileName(pAudioFile.FileName, pWebRootPath);
            var lFullPath = Path.Combine(pWebRootPath, cUploadFolder, lNewFilename);

            using (var lStream = System.IO.File.Create(lFullPath))
            {
                await pAudioFile.CopyToAsync(lStream);
            }

            return lNewFilename;
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

        /// <summary> Creates full path with random filename. </summary>
        /// <remarks> Doetsch, 18.12.19. </remarks>
        /// <param name="pOriginalFilename"> The file. </param>
        /// <param name="pWebRootPath">      Full pathname of the web root file. </param>
        /// <returns> The new full path. </returns>
        private static string CreateFileName(string pOriginalFilename, string pWebRootPath)
        {
            // create guid for filename
            var lNewFilename = Guid.NewGuid().ToString().Replace("-", "");

            // append suffix
            var lSuffix = Path.GetExtension(pOriginalFilename).ToLowerInvariant();

            if (lSuffix == null)
            {
                throw new ArgumentException("the argument 'pOriginalFilename' should have and suffix like '.jpg'.");
            }

            lNewFilename += lSuffix;

            return lNewFilename;
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
