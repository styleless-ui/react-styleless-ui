import { type AppProps } from "next/app";
import Head from "next/head";
import "../.dev/styles.css";

const _App = (props: AppProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { Component: Page, pageProps } = props;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, maximum-scale=5.0, minimum-scale=1.0"
          key="viewport"
        />
      </Head>
      <div id="main-wrapper">
        <Page {...pageProps} />
      </div>
    </>
  );
};

export default _App;
