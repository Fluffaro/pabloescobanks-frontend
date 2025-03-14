"use client";
import { useRouter } from "next/navigation";

export const handleApiError = async (response: Response, router: any) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: "An unknown error occurred" };
    }

    const status = response.status;

    switch (status) {
      case 400:
        router.push("/error/400");
        break;
      case 401:
        router.push("/error/401");
        break;
      case 403:
        router.push("/error/403"); // You don't have a 403 page yet, consider adding one
        break;
      case 404:
        router.push("/error/404");
        break;
      case 405:
        router.push("/error/405");
        break;
      case 408:
        router.push("/error/408");
        break;
      case 429:
        router.push("/error/429");
        break;
      default:
        console.error(`Unhandled error: ${status} - ${errorData.message}`);
    }

    throw new Error(errorData.message || "Something went wrong");
  }
};
