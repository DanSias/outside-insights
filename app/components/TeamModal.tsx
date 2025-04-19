// app/components/TeamModal.tsx
import { Dialog, Transition } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { Fragment, useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface TeamFormValues {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isPersonal?: boolean;
}

interface ActionData {
  errors?: Partial<Record<keyof TeamFormValues, string>>;
}

export default function TeamModal({
  isOpen,
  onClose,
  initialValues,
  isEditing = false,
  actionUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: TeamFormValues;
  isEditing?: boolean;
  actionUrl: string;
}) {
  const cancelButtonRef = useRef(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<ActionData>();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl ?? "");
  const [isPersonal, setIsPersonal] = useState(
    initialValues?.isPersonal ?? false,
  );
  const justSubmitted = useRef(false);

  const isSubmitting = fetcher.state === "submitting";
  const actionData = fetcher.data as ActionData | undefined;

  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      );
    }
  }, [name, slugTouched]);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      justSubmitted.current = true;
    }

    if (
      fetcher.state === "idle" &&
      justSubmitted.current &&
      fetcher.data &&
      !fetcher.data.errors
    ) {
      toast.success(isEditing ? "Team updated!" : "Team created!");
      justSubmitted.current = false;
      onClose();
    }
  }, [fetcher]);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameInputRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-6 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 dark:bg-gray-800">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  {isEditing ? "Edit Team" : "Create New Team"}
                </Dialog.Title>

                <fetcher.Form
                  method="post"
                  action={actionUrl}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="form-label">
                      Team Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      ref={nameInputRef}
                    />
                    {actionData?.errors?.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {actionData.errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="slug" className="form-label">
                      Team Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      required
                      className="form-input"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugTouched(true);
                      }}
                    />
                    {actionData?.errors?.slug && (
                      <p className="mt-1 text-sm text-red-500">
                        {actionData.errors.slug}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      className="form-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="logoUrl" className="form-label">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      name="logoUrl"
                      id="logoUrl"
                      className="form-input"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPersonal"
                      id="isPersonal"
                      className="form-checkbox"
                      checked={isPersonal}
                      onChange={(e) => setIsPersonal(e.target.checked)}
                    />
                    <label htmlFor="isPersonal" className="form-label">
                      This is a personal team
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={onClose}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      ) : null}
                      {isSubmitting
                        ? isEditing
                          ? "Saving..."
                          : "Creating..."
                        : isEditing
                          ? "Save"
                          : "Create"}
                    </button>
                  </div>
                </fetcher.Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
