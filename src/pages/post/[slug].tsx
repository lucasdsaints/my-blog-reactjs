import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { formatDate } from '../../utils/format';

import styles from './post.module.scss';

interface PrismicPost {
  first_publication_date: string | null;
  data: {
    author: string;
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    group: {
      heading: string;
      body: any[];
    }[];
  };
}

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    group: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  function calculateReadingTime(group: { heading: string; body: any[] }[]) {
    const groupTextLength = group.reduce((total, section) => {
      const sectionTextLength = section.heading.split(' ').length + RichText.asText(section.body).split(' ').length;
      return total + sectionTextLength;
    }, 0);

    const readingTimeInMinutes = Math.ceil(groupTextLength / 200);

    return readingTimeInMinutes;
  }

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Header />
      <main className={styles.postContainer}>
        <div style={{ backgroundImage: `url(${post.data?.banner?.url})` }} className={styles.banner} />

        <div className={styles.content}>
          <section>
            <h1>{post.data.title}</h1>
            <div className={styles.aditionalInfos}>
              <FiCalendar fontSize="1.25rem" />
              <time>{formatDate(post.first_publication_date)}</time>

              <FiUser fontSize="1.25rem" />
              <span>{post.data.author}</span>

              <FiClock fontSize="1.25rem" />
              <span>{calculateReadingTime(post.data.content)} min</span>
            </div>
          </section>

          {post.data.content.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(section.body) }} />
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postResponse = await prismic.query([Prismic.predicates.at('document.type', 'post')], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
  });

  const paths = postResponse.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response: PrismicPost = await prismic.getByUID('posts', String(slug), {});

  if (!response) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  // const otherPosts = results.filter(
  //   (post, index) =>
  //     index === currentPostPositionIndex + 1 ||
  //     index === currentPostPositionIndex - 1
  // );

  // const navigationItems = {
  //   nextPost: otherPosts[0] ?? null,
  //   previousPost: otherPosts[1] ?? null,
  // };

  // const post: Post = {
  //   ...response,
  //   // first_publication_date: response.first_publication_date,
  //   data: {
  //     ...response.data,
  //     // author: response.data?.author ?? '',
  //     // title: response.data?.title ?? '',
  //     // banner: {
  //     //   url: response.data?.banner?.url ?? '',
  //     // },
  //     content:
  //       response.data?.group?.map(group => ({
  //         heading: group.heading,
  //         body: group.body,
  //       })) ?? [],
  //   },
  // };

  return {
    // props: { post },
    props: {
      post: response,
      // navigationItems,
    },
  };
};
