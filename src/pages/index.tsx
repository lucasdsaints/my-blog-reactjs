import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

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

export default function Home({ postsPagination }: HomeProps) {
  const [nextPageLink, setNextPageLink] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleLoadMore() {
    try {
      const result = await fetch(nextPageLink);
      const data: PostPagination = await result.json();

      setNextPageLink(data.next_page);
      setPosts([...posts, ...data.results]);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Erro ao buscar novos posts...');
      // eslint-disable-next-line no-console
      console.log(e.message);
    }
  }

  return (
    <main className={styles.contentContainer}>
      <h1>
        <img src="logo.svg" alt="Space traveling logo." />
      </h1>
      <ul>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <li className={styles.post}>
              <h2>{post.data.title}</h2>
              <span>{post.data.subtitle}</span>
              <div className={styles.aditionalInfo}>
                <FiCalendar fontSize="1.25rem" />
                <time>15 Mar 2021</time>

                <FiUser fontSize="1.25rem" />
                <span>{post.data.author}</span>
              </div>
            </li>
          </Link>
        ))}
      </ul>
      {nextPageLink && (
        <button type="button" onClick={handleLoadMore}>
          Carregar mais posts
        </button>
      )}
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
