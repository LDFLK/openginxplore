import ErrorPage from "../components/ErrorPage";

export default function Error404() {
  return (
    <ErrorPage
      statusCode="404"
      title="Page not found"
      description="The page you're looking for doesn't exist, may have moved, or is no longer available."
    />
  );
}
