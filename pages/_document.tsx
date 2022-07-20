import Document, { Head, Html, Main, NextScript } from "next/document";

const googleFontFamily =
  "https://fonts.googleapis.com/css2?" +
  "family=Roboto+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&" +
  "family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&" +
  "display=swap";

class _Document extends Document {
  override render(): JSX.Element {
    return (
      <Html lang="en-US">
        <Head>
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta property="robots" content="Index, Follow" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="google" content="notranslate" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="preload" as="style" href={googleFontFamily} />
          <link rel="stylesheet" href={googleFontFamily} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default _Document;
