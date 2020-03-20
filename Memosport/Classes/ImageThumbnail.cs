using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Memosport.Classes
{
    /// <summary> Interface for image thumbnail. </summary>
    /// <remarks> Doetsch, 20.03.20. </remarks>
    public interface IImageThumbnail
    {
        void Create(string pSourcePath, string pTargetPath);
    }

    /// <summary> An image thumbnail. </summary>
    /// <remarks> Doetsch, 20.03.20. </remarks>
    public class ImageThumbnail
    {
        /// <summary> The maximum dimension x/y in px for thumbnails. </summary>
        private const double cMaxDimension = 100;

        private const long cQuality = 100;

        public void Create(string pSourcePath, string pTargetPath)
        {
            ImageDimension lImageDimension;

            // validate params
            if (string.IsNullOrEmpty(pSourcePath) || string.IsNullOrEmpty(pTargetPath))
            {
                throw new InvalidEnumArgumentException();
            }

            //
            // Load via stream rather than Image.FromFile to release the file
            // handle immediately
            //
            using (Stream lFileStream = new FileStream(pSourcePath, FileMode.Open))
            {
                using (Image lImage = Image.FromStream(lFileStream))
                {
                    // calculate width/height for the thumbnail dependent on the current dimension
                    lImageDimension = GetImageDimension(lImage);

                    using (Bitmap lBitmap = new Bitmap((int)lImageDimension.Width, (int)lImageDimension.Height))
                    {
                        using (Graphics lGraphics = Graphics.FromImage(lBitmap))
                        {
                            lGraphics.SmoothingMode = SmoothingMode.HighQuality;
                            lGraphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                            lGraphics.DrawImage(lImage, 0, 0, lBitmap.Width, lBitmap.Height);

                            ImageCodecInfo lImageCodecInfo = null;
                            
                            ImageCodecInfo[] lImageDecoders = ImageCodecInfo.GetImageDecoders();

                            foreach (ImageCodecInfo lImageCodecInfoTmp in lImageDecoders)
                            {
                                if (lImageCodecInfoTmp.FormatID == ImageFormat.Jpeg.Guid || lImageCodecInfoTmp.FormatID == ImageFormat.Png.Guid)
                                {
                                    lImageCodecInfo = lImageCodecInfoTmp;
                                    break;
                                }
                            }

                            if (lImageCodecInfo != null)
                            {
                                EncoderParameters lEncoderParameters = new EncoderParameters(1);
                                lEncoderParameters.Param[0] = new EncoderParameter(Encoder.Quality, cQuality);
                                lBitmap.Save(pTargetPath, lImageCodecInfo, lEncoderParameters);
                            }
                            else
                            {
                                lBitmap.Save(pTargetPath, lImage.RawFormat);
                            }
                        }
                    }
                }
            }
        }

        /// <summary> Gets image dimension. </summary>
        /// <remarks> Doetsch, 20.03.20. </remarks>
        /// <param name="pImage"> The image. </param>
        /// <returns> The image dimension. </returns>
        private static ImageDimension GetImageDimension(Image pImage)
        {
            var lImageDimension = new ImageDimension();

            if (pImage.Height < pImage.Width)
            {
                lImageDimension.Width = cMaxDimension;
                lImageDimension.Height = (cMaxDimension / (double)pImage.Width) * pImage.Height;
            }
            else
            {
                lImageDimension.Height = cMaxDimension;
                lImageDimension.Width = (cMaxDimension / (double)pImage.Height) * pImage.Width;
            }

            return lImageDimension;
        }
    }
}

class ImageDimension
{
    public double Width { get; set; }
    public double Height { get; set; }
}