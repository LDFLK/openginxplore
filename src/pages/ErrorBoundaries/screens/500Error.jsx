import ErrorPage from "../components/ErrorPage";

export default function Error500() {
  return (
    <ErrorPage
      statusCode="500"
      title="Something went wrong"
      description="We couldn't complete your request because of an internal server error. Please try again shortly."
    />
  );
}
