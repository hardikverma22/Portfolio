import emailjs from "@emailjs/browser";
import {useRef, useState} from "react";
import {useForm} from "react-hook-form";
import toast from "react-hot-toast";
import {BsCheck, MdErrorOutline} from "../Icons";

const ContactForm = () => {
  const formRef = useRef();

  const [isSending, setIsSending] = useState(false);
  const {
    register,
    formState,
    formState: {errors, touchedFields},
    handleSubmit,
    reset,
  } = useForm({mode: "all"});

  const onSubmit = (data) => {
    setIsSending(true);
    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        (result) => {
          console.log(result.text);
          toast.success("Thanks for getting in touch! I'll be in contact soon");
          reset();
        },
        (error) => {
          toast.error("Error Sending email. Try again in sometime.");
        }
      )
      .finally(() => setIsSending(false));
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col -gap-3">
            <label
              htmlFor="name"
              className={`${
                errors.name ? "text-red-500" : touchedFields.name ? "text-green-600" : "text-gray-500 dark:text-white"
              } text-sm font-medium`}
            >
              Your Name
            </label>
            <label className="relative w-full">
              <input
                {...register("name", {
                  required: "Uh oh, looks like you forgot to tell your name!",
                })}
                aria-invalid={errors?.name ? "true" : "false"}
                className={`w-full border-b dark:text-white focus:border-b ${
                  errors.name
                    ? "border-red-500"
                    : touchedFields.name
                    ? "border-green-600"
                    : "border-gray-500 dark:border-white"
                } focus:outline-none active:border-b bg-transparent placeholder:text-sm placeholder:pt-2
                disabled:bg-gray-100 disabled:rounded-sm`}
                type="text"
                name="name"
                disabled={isSending}
              />
              {errors.name ? (
                <MdErrorOutline className="absolute right-0 top-0 mx-auto text-2xl text-red-600" />
              ) : touchedFields.name ? (
                <BsCheck className="absolute right-0 top-0 mx-auto text-2xl text-green-600" />
              ) : (
                ""
              )}
            </label>
            {errors.name && <p className="text-red-500 pt-2">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className={`${
                errors.email ? "text-red-500" : touchedFields.email ? "text-green-600" : "text-gray-500 dark:text-white"
              } text-sm font-medium`}
            >
              Your Email
            </label>
            <div className="relative w-full">
              <input
                {...register("email", {
                  required: "Uh oh, looks like you forgot to tell your email!",
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: "Oops! It looks like the email you entered isn't valid.",
                  },
                })}
                className={`w-full border-b dark:text-white ${
                  errors.email
                    ? "border-red-500"
                    : touchedFields.email
                    ? "border-green-600"
                    : "border-gray-500 dark:border-white"
                } focus:outline-none active:border-b bg-transparent disabled:bg-gray-100 disabled:rounded-sm`}
                type="text"
                name="email"
                disabled={isSending}
              />
              {errors.email ? (
                <MdErrorOutline className="absolute right-0 top-0 mx-auto text-2xl text-red-600" />
              ) : touchedFields.email ? (
                <BsCheck className="absolute right-0 top-0 mx-auto text-2xl text-green-600" />
              ) : (
                ""
              )}
            </div>
            {errors.email?.type === "required" && <p className="text-red-500 pt-2">{errors.email.message}</p>}
            {errors.email?.type === "pattern" && <p className="text-red-500 pt-2">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="message"
              className={`${
                errors.message ? "text-red-500" : "text-gray-500 dark:text-white"
              } text-gray-500 text-sm font-medium`}
            >
              Message
            </label>
            <div className="relative w-full">
              <textarea
                {...register("message", {
                  required: "Would be great if you can add a message, I promise I read every word.",
                })}
                name="message"
                cols="30"
                rows="10"
                placeholder="write your message here"
                className={`w-full dark:text-white placeholder:text-sm placeholder:pt-2 resize-none h-32 border-b ${
                  errors.message
                    ? "placeholder:text-red-500 border-red-500"
                    : touchedFields.message
                    ? " border-green-500"
                    : "placeholder:text-gray-500 border-gray-500 dark:border-white dark:placeholder:text-white"
                }  focus:outline-none active:border-b bg-transparent disabled:bg-gray-100 disabled:rounded-sm`}
                disabled={isSending}
              />
              {errors.message ? (
                <MdErrorOutline className="absolute right-0 top-0 mx-auto text-2xl text-red-600" />
              ) : touchedFields.message ? (
                <BsCheck className="absolute right-0 top-0 mx-auto text-2xl text-green-600" />
              ) : (
                ""
              )}
            </div>
            {errors.message && <p className="text-red-500 pt-2">{errors.message.message}</p>}
          </div>
          <button
            disabled={!formState.isValid || isSending}
            className={`p-2 h-full w-40 ${
              !formState.isValid ? "bg-gray-500" : "bg-tertiary"
            } text-white shadow-md rounded-lg disabled:bg-gray-500`}
          >
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </>
  );
};

export default ContactForm;
