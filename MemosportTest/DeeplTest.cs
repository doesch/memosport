using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;
using Memosport.Classes;
using System.Threading.Tasks;

namespace MemosportTest
{
    [TestClass]
    public class DeeplTest
    {
        [TestMethod]
        public async Task TranslateTest()
        {
            // Arrange           
            var lTextDe = "Hallo Welt!";
            var lExpectedTranslation = "Hello World!";

            // Act
            var lTranslation = await Deepl.Translate("de", "en", lTextDe);

            // Assert
            Assert.AreEqual(lExpectedTranslation, lTranslation);
        }
    }
}
