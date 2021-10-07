using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Memosport.Classes
{
    /// <summary> Values that represent languages. </summary>
    /// <remarks> Doetsch, 07.10.2021. </remarks>
    public enum Language
    {
        de,
        en
    }

    /// <summary> A deepl translator </summary>
    /// <remarks> Doetsch, 07.10.2021. </remarks>
    public static class Deepl
    {
        /// <summary> (Immutable) the API key. </summary>
        /// Source: https://www.deepl.com/de/pro-account/summary
        private const string ApiKey = "4f100c06-41e9-631a-f17f-8fec384a6774:fx";

        public async static Task<string> Translate(Language pCurrentLang, Language pTargetLang, string pText)
        {
            string lTranslatedString = string.Empty;

            using (var lClient = new HttpClient())
            {
                // the post data
                var lPostData = new StringContent(string.Empty);

                // act
                // you can build the url here: https://www.deepl.com/de/docs-api/simulator/
                var lUrl = $"https://api-free.deepl.com/v2/translate?auth_key={ApiKey}&text={pText}&source_lang={pCurrentLang}&target_lang={pTargetLang.ToString()}";

                var lHttpPostMessage = await lClient.GetAsync(lUrl);

                // parse result to json and extract translated string
                if (lHttpPostMessage.IsSuccessStatusCode)
                {
                    var lJsonString = await lHttpPostMessage.Content.ReadAsStringAsync();
                    DeeplResponse lDeeplResponse = JsonSerializer.Deserialize<DeeplResponse>(lJsonString);
                    lTranslatedString = lDeeplResponse.Translations[0].Text;
                }
            }

            // serialize

            return lTranslatedString;
        }
    }

    /// <summary> A deepl response. </summary>
    /// <remarks> Doetsch, 07.10.2021. </remarks>
    public class DeeplResponse
    {
        [JsonPropertyName("translations")]
        public List<DeeplTranslations> Translations { get; set; }
    }

    /// <summary> A deepl translations. </summary>
    /// <remarks> Doetsch, 07.10.2021. </remarks>
    public class DeeplTranslations
    {
        [JsonPropertyName("text")]
        public string Text { get; set; }
    }
}
