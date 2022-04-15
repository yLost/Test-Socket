import { useTheme, Link, Button, Loading } from "@wipsie/ui";
import DefaultLayout from "../components/DefaultLayout";
import NextLink from "next/link";
import { isProd } from "../config";
import { useSelector, useDispatch } from "react-redux";
import { buyCake } from "../redux/slices/cake";
import { fetchUsers } from "../redux/slices/user";
import { fetchPosts } from "../redux/slices/blog";
import { useEffect, useState } from "react";

import axios from "axios";
import io from "socket.io-client";

export default function Home(props) {
  const theme = useTheme();
  const { numberOfCakes } = useSelector((state: any) => state.cake);
  const { users, loading } = useSelector((state: any) => state.user);
  const { posts } = useSelector((state: any) => state.blog);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPosts());
  }, []);

  // Socket setup start
  const [socket, setSocket] = useState(null);

  const EVENTS = [
    "NEW_FOLLOWER_PROJECT",
    "NEW_FOLLOWER_USER",
    "NEW_POST_PROJECT",
    "NEW_POST_USER",
    "NEW_COMMENT",
  ];

  useEffect(() => {
    async function fetchData() {
      const authApi = axios.create({
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (socket != null) {
        socket.disconnect();
      }

      // const currentSessionRequest = await authApi.post(`/api/auth/session`);
      // const currentSession = currentSessionRequest.data;

      const _socket = io("https://env.dev.api.wipsie.com", {
        path: "/sockets/socket.io/",
        query: {
          pageRefId: "editor01",
          token: "",
        },
      });

      _socket.on("NEW_FOLLOWER_PROJECT", (data) => {
        console.log(data);
      });

      console.log(_socket);

      setSocket(_socket);
    }

    if (!socket) {
      fetchData();
    }

    return () => {
      if (socket != null) {
        socket.off("NEW_FOLLOWER_PROJECT");

        socket.disconnect();
      }
    };
  }, [socket]);
  // Socket setup end

  return (
    <DefaultLayout meta={{}}>
      <NextLink href="/dois">
        <Link>Dois</Link>
      </NextLink>
      <Button onClick={() => dispatch(buyCake())}>num: {numberOfCakes}</Button>
      {loading ? (
        <Loading />
      ) : (
        users.map((user: any) => <p key={user.id}>{user.name}</p>)
      )}

      {posts.map((post: any) => (
        <p key={post.id}>{post.title}</p>
      ))}
    </DefaultLayout>
  );
}
