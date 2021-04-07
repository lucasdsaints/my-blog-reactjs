import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <main className={styles.contentContainer}>
      <h1>
        <img src="logo.svg" alt="Space traveling logo." />
      </h1>
      <div className={styles.post}>
        <h2>Como utilizar hooks</h2>
        <span>Pensando em sincronização em vez de ciclos de vida.</span>
        <time>15 Mar 2021</time>
        <span>Joseph Oliveira</span>
      </div>
      <button type="button">Carregar mais posts</button>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', { pageSize: 2 });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results || [],
      },
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
