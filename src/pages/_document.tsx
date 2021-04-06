import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head />
        <Main />
        <NextScript />
      </Html>
    );
  }
}
