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

        /// <summary> The thumbnail suffix. </summary>
        private const string cThumbnailSuffix = "_thumb";

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

            // create thumbnail
            CreateThumbnail(lFullPath);

            return lNewFilename;
        }

        /// <summary> Copies the file. </summary>
        /// <remarks> Doetsch, 15.01.20. </remarks>
        /// <param name="pOriginalFilename"> The file. </param>
        /// <param name="pWebRootPath">      Full pathname of the web root file. </param>
        /// <returns> An asynchronous result that yields a string. </returns>
        public static string CopyFile(string pOriginalFilename, string pWebRootPath)
        {
            // create filename
            var lNewFilename = CreateFileName(pOriginalFilename, pWebRootPath);
            var lTargetFullPath = Path.Combine(pWebRootPath, cUploadFolder, lNewFilename);

            var lOriginalFullPath = Path.Combine(pWebRootPath, cUploadFolder, pOriginalFilename);

            File.Copy(lOriginalFullPath, lTargetFullPath);

            // create thumbnail
            CreateThumbnail(lTargetFullPath);

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

            // when it is an image file then delete also the thumbnail
            var lThumbnailFullPath = FullPathThumbnailBySourceFullPath(lFullPath);
            if (File.Exists(lThumbnailFullPath))
            {
                File.Delete(lThumbnailFullPath);
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

        /// <summary> Initializes a new instance of the Memosport.Classes.Upload class. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        /// <param name="pSourceFullPath"> Full pathname of the source full file. </param>
        private static void CreateThumbnail(string pSourceFullPath)
        {
            // examine source path
            var lFullPathThumbnail = FullPathThumbnailBySourceFullPath(pSourceFullPath);

            new ImageThumbnail().Create(pSourceFullPath, lFullPathThumbnail);
        }

        /// <summary> Full path thumbnail by source full path. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        /// <param name="pSourceFullPath"> Full pathname of the source full file. </param>
        /// <returns> A string. </returns>
        public static string FullPathThumbnailBySourceFullPath(string pSourceFullPath)
        {
            // convert a path C:\foobar\aksdjföalksdjfökas.jpg 
            // into C:\foobar\aksdjföalksdjfökas_thumb.jpg

            var lFileName = Path.GetFileName(pSourceFullPath);
            var lFullPathTargetFolder = Path.GetDirectoryName(pSourceFullPath);
            var lFileNameThumb = $"{Path.GetFileNameWithoutExtension(lFileName)}{cThumbnailSuffix}{Path.GetExtension(lFileName)}";
            var lFullPathThumbnail = Path.Combine(lFullPathTargetFolder, lFileNameThumb);
            return lFullPathThumbnail;
        }

        /// <summary> Creates thumbnails for all images. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        /// <param name="pWebRootPath"> Full pathname of the web root file. </param>
        /// ToDo: Delete this code when done.
        public static void CreateThumbnailsForAllImages(string pWebRootPath)
        {
            string[] lFilePaths = Directory.GetFiles(Path.Combine(pWebRootPath, cUploadFolder));

            foreach (var lFilePath in lFilePaths)
            {
                //  check if it is an thumbnail itself
                if (lFilePath.Contains(cThumbnailSuffix) == false)
                {
                    var lTargetPath = FullPathThumbnailBySourceFullPath(lFilePath);

                    // do only create if thumbnail and thumbnail not exists
                    if (File.Exists(lTargetPath) == false)
                    {
                        // create thumb
                        new ImageThumbnail().Create(lFilePath, lTargetPath);
                    }
                }
            }
        }
    }
}
