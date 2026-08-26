"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    CheckCircle2,
    ChevronDown,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Send,
    Sparkles,
    MessageCircle,
} from "lucide-react";

import { useSelector } from "react-redux";
import { selectPublicImages } from "../../lib/slices/imageSlice";
import { getDynamicImageSrc } from "../../lib/utils/imageUtils";

const FALLBACK_CONTACT = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

/* ============================================================
   CONFIG
============================================================ */

const OWNER_WHATSAPP = "919999999999";
// Replace with client's real WhatsApp number.
// Format: country code + number.
// Example: 919876543210
// Do NOT use +, spaces or hyphens.


/* ============================================================
   SERVICES
============================================================ */

const serviceOptions = [
    "Exterior Wash",
    "Interior Cleaning",
    "Full Car Detailing",
    "Ceramic Coating",
    "Premium Wash Package",
];


/* ============================================================
   FORM
============================================================ */

const initialForm = {
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
};


/* ============================================================
   COMPONENT
============================================================ */

const Contact = () => {
    const publicImages = useSelector(selectPublicImages);
    const dynamicContactImg = getDynamicImageSrc(publicImages["contact_image"]) || FALLBACK_CONTACT;

    const [formData, setFormData] = useState(initialForm);

    const [status, setStatus] = useState<
        "idle" | "loading" | "success"
    >("idle");

    const [error, setError] = useState("");


    /* ==========================================================
       INPUT CHANGE
    ========================================================== */

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };


    /* ==========================================================
       WHATSAPP MESSAGE
    ========================================================== */

    const createWhatsAppMessage = () => {
        return `
🚗 *NEW CAR WASH REQUEST*

━━━━━━━━━━━━━━━━━━

👤 *CUSTOMER DETAILS*

Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

━━━━━━━━━━━━━━━━━━

🧽 *SERVICE REQUESTED*

${formData.service}

━━━━━━━━━━━━━━━━━━

📝 *CUSTOMER MESSAGE*

${formData.message.trim() || "No additional message"}

━━━━━━━━━━━━━━━━━━

📍 *SOURCE*

Website Contact Form

Please contact the customer to confirm the booking.

Thank you.
        `.trim();
    };


    /* ==========================================================
       SUBMIT
    ========================================================== */

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!formData.name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        if (!formData.service) {
            setError("Please select a service.");
            return;
        }


        /* ---------------------------------------------
           PHONE VALIDATION
        --------------------------------------------- */

        const phoneDigits = formData.phone.replace(/\D/g, "");

        if (phoneDigits.length < 10) {
            setError("Please enter a valid phone number.");
            return;
        }


        /* ---------------------------------------------
           LOADING
        --------------------------------------------- */

        setStatus("loading");


        try {
            const message = createWhatsAppMessage();

            const whatsappUrl =
                `https://wa.me/${OWNER_WHATSAPP}` +
                `?text=${encodeURIComponent(message)}`;


            /* -----------------------------------------
               OPEN WHATSAPP
            ----------------------------------------- */

            window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
            );


            /* -----------------------------------------
               RESET
            ----------------------------------------- */

            setFormData(initialForm);

            setStatus("success");
        } catch {
            setError(
                "Unable to open WhatsApp. Please try again."
            );

            setStatus("idle");
        }
    };


    /* ==========================================================
       RENDER
    ========================================================== */

    return (
        <section
            id="contact"
            className="
                overflow-hidden
                bg-[var(--color-page-bg)]
                px-5
                py-20
                sm:px-8
                sm:py-24
                lg:px-12
                lg:py-32
            "
        >
            <div className="mx-auto max-w-[1400px]">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        grid
                        gap-6
                        lg:grid-cols-[0.65fr_1.35fr]
                        lg:items-end
                        lg:gap-12
                    "
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="
                                h-[2px]
                                w-8
                                bg-[var(--color-primary)]
                                sm:w-12
                            "
                        />

                        <span
                            className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.24em]
                                text-[var(--color-primary)]
                                sm:text-[10px]
                            "
                        >
                            Contact
                        </span>
                    </div>

                    <div>
                        <h2
                            className="
                                max-w-[900px]
                                font-heading
                                text-[2.8rem]
                                font-semibold
                                uppercase
                                leading-[0.9]
                                tracking-[-0.06em]
                                text-[var(--color-heading)]
                                sm:text-[4rem]
                                md:text-[5rem]
                                lg:text-[6rem]
                            "
                        >
                            Let's take care
                            <br />

                            <span className="text-[var(--color-primary)]">
                                of your car.
                            </span>
                        </h2>

                        <p
                            className="
                                mt-6
                                max-w-[600px]
                                text-sm
                                leading-7
                                text-[var(--color-text)]
                                sm:text-base
                            "
                        >
                            Tell us what your vehicle needs and
                            connect directly with our team on
                            WhatsApp.
                        </p>
                    </div>
                </div>


                {/* =================================================
                    MAIN
                ================================================= */}

                <div
                    className="
                        mt-12
                        grid
                        gap-12
                        sm:mt-16
                        lg:mt-20
                        lg:grid-cols-[0.85fr_1.15fr]
                        lg:gap-20
                    "
                >

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div className="w-full">
                        {dynamicContactImg && (
                            <div
                                className="
                                    relative
                                    h-[280px]
                                    overflow-hidden
                                    sm:h-[400px]
                                    lg:h-[560px]
                                "
                            >
                                <Image
                                    src={dynamicContactImg}
                                    alt="Professional car wash service"
                                    fill
                                    priority
                                    sizes="
                                        (max-width: 640px) 100vw,
                                        (max-width: 1024px) 90vw,
                                        45vw
                                    "
                                    className="
                                        object-cover
                                        object-center
                                        transition-transform
                                        duration-700
                                        hover:scale-[1.02]
                                    "
                                />

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        bg-gradient-to-t
                                        from-black/65
                                        via-black/10
                                        to-transparent
                                    "
                                />

                                {/* IMAGE LABEL */}

                                <div
                                    className="
                                        absolute
                                        left-5
                                        top-5
                                        flex
                                        items-center
                                        gap-2
                                        sm:left-7
                                        sm:top-7
                                    "
                                >
                                    <Sparkles
                                        size={14}
                                        className="
                                            text-[var(--color-primary)]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[8px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                            text-white
                                            sm:text-[9px]
                                        "
                                    >
                                        Professional Car Care
                                    </span>
                                </div>

                                {/* IMAGE TEXT */}

                                <div
                                    className="
                                        absolute
                                        bottom-5
                                        left-5
                                        right-5
                                        sm:bottom-7
                                        sm:left-7
                                    "
                                >
                                    <p
                                        className="
                                            max-w-[350px]
                                            text-xl
                                            font-semibold
                                            leading-tight
                                            tracking-[-0.03em]
                                            text-white
                                            sm:text-2xl
                                        "
                                    >
                                        Clean car.
                                        <br />
                                        Clear mind.
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* =================================================
                            CONTACT DETAILS
                        ================================================= */}

                        <div
                            className="
                                mt-8
                                grid
                                gap-6
                                sm:grid-cols-2
                                lg:grid-cols-1
                            "
                        >

                            {/* PHONE */}

                            <a
                                href="tel:+919999999999"
                                className="
                                    group
                                    flex
                                    items-center
                                    gap-4
                                "
                            >
                                <span
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        bg-[var(--color-primary-light)]
                                        text-[var(--color-primary)]
                                        transition
                                        duration-300
                                        group-hover:bg-[var(--color-primary)]
                                        group-hover:text-white
                                    "
                                >
                                    <Phone size={18} />
                                </span>

                                <span>
                                    <span
                                        className="
                                            block
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            text-[var(--color-text-light)]
                                        "
                                    >
                                        Call Us
                                    </span>

                                    <span
                                        className="
                                            mt-1
                                            block
                                            text-sm
                                            font-bold
                                            text-[var(--color-heading)]
                                            sm:text-base
                                        "
                                    >
                                        +91 99999 99999
                                    </span>
                                </span>
                            </a>


                            {/* EMAIL */}

                            <a
                                href="mailto:hello@autofixer.com"
                                className="
                                    group
                                    flex
                                    items-center
                                    gap-4
                                "
                            >
                                <span
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        bg-[var(--color-primary-light)]
                                        text-[var(--color-primary)]
                                        transition
                                        duration-300
                                        group-hover:bg-[var(--color-primary)]
                                        group-hover:text-white
                                    "
                                >
                                    <Mail size={18} />
                                </span>

                                <span>
                                    <span
                                        className="
                                            block
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            text-[var(--color-text-light)]
                                        "
                                    >
                                        Email Us
                                    </span>

                                    <span
                                        className="
                                            mt-1
                                            block
                                            break-all
                                            text-sm
                                            font-bold
                                            text-[var(--color-heading)]
                                            sm:text-base
                                        "
                                    >
                                        hello@autofixer.com
                                    </span>
                                </span>
                            </a>


                            {/* WHATSAPP */}

                            <button
                                type="button"
                                onClick={() => {
                                    const whatsappUrl =
                                        `https://wa.me/${OWNER_WHATSAPP}`;

                                    window.open(
                                        whatsappUrl,
                                        "_blank",
                                        "noopener,noreferrer"
                                    );
                                }}
                                className="
                                    group
                                    flex
                                    w-full
                                    items-center
                                    gap-4
                                    border-none
                                    bg-transparent
                                    p-0
                                    text-left
                                "
                            >
                                <span
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        bg-[var(--color-primary-light)]
                                        text-[var(--color-primary)]
                                        transition
                                        duration-300
                                        group-hover:scale-105
                                    "
                                >
                                    <MessageCircle size={19} />
                                </span>

                                <span>
                                    <span
                                        className="
                                            block
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            text-[var(--color-text-light)]
                                        "
                                    >
                                        WhatsApp
                                    </span>

                                    <span
                                        className="
                                            mt-1
                                            block
                                            text-sm
                                            font-bold
                                            text-[var(--color-heading)]
                                            sm:text-base
                                        "
                                    >
                                        Chat with our team
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>


                    {/* =================================================
                        RIGHT FORM
                    ================================================= */}

                    <div className="w-full lg:pt-2">

                        {status === "success" ? (

                            /* =================================================
                                SUCCESS STATE
                            ================================================= */

                            <div
                                className="
                                    flex
                                    min-h-[400px]
                                    flex-col
                                    items-start
                                    justify-center
                                    bg-[var(--color-section-bg)]
                                    p-6
                                    sm:min-h-[500px]
                                    sm:p-10
                                    lg:p-14
                                "
                            >
                                <span
                                    className="
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center
                                        bg-[#25D366]
                                        text-white
                                    "
                                >
                                    <CheckCircle2 size={27} />
                                </span>

                                <h3
                                    className="
                                        mt-7
                                        font-heading
                                        text-3xl
                                        font-semibold
                                        tracking-[-0.04em]
                                        text-[var(--color-heading)]
                                        sm:text-4xl
                                    "
                                >
                                    WhatsApp opened.
                                </h3>

                                <p
                                    className="
                                        mt-4
                                        max-w-[500px]
                                        text-sm
                                        leading-7
                                        text-[var(--color-text)]
                                        sm:text-base
                                    "
                                >
                                    Your booking details have been
                                    prepared in WhatsApp. Review the
                                    message and tap Send to contact
                                    our team.
                                </p>

                                <div
                                    className="
                                        mt-6
                                        flex
                                        items-center
                                        gap-2
                                        text-xs
                                        font-semibold
                                        text-[#25D366]
                                    "
                                >
                                    <MessageCircle size={16} />

                                    Ready to send
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setStatus("idle")
                                    }
                                    className="
                                        mt-7
                                        text-sm
                                        font-bold
                                        text-[var(--color-primary)]
                                        transition
                                        hover:text-[var(--color-heading)]
                                    "
                                >
                                    Send another request →
                                </button>
                            </div>

                        ) : (

                            /* =================================================
                                FORM
                            ================================================= */

                            <>
                                <div>
                                    <p
                                        className="
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                            text-[var(--color-text-light)]
                                        "
                                    >
                                        WhatsApp Booking
                                    </p>

                                    <h3
                                        className="
                                            mt-3
                                            max-w-[600px]
                                            font-heading
                                            text-2xl
                                            font-semibold
                                            tracking-[-0.04em]
                                            text-[var(--color-heading)]
                                            sm:text-3xl
                                        "
                                    >
                                        Tell us what your car needs.
                                    </h3>
                                </div>


                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-8 sm:mt-10"
                                >

                                    <div
                                        className="
                                            grid
                                            gap-x-8
                                            gap-y-7
                                            sm:grid-cols-2
                                        "
                                    >

                                        {/* NAME */}

                                        <label className="block">
                                            <span
                                                className="
                                                    mb-2
                                                    block
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.16em]
                                                    text-[var(--color-text-light)]
                                                "
                                            >
                                                Name *
                                            </span>

                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Your name"
                                                autoComplete="name"
                                                className="
                                                    w-full
                                                    border-b
                                                    border-[var(--color-divider)]
                                                    bg-transparent
                                                    px-0
                                                    py-3
                                                    text-sm
                                                    font-medium
                                                    text-[var(--color-heading)]
                                                    outline-none
                                                    transition
                                                    placeholder:text-[var(--color-text-light)]
                                                    focus:border-[var(--color-primary)]
                                                "
                                            />
                                        </label>


                                        {/* EMAIL */}

                                        <label className="block">
                                            <span
                                                className="
                                                    mb-2
                                                    block
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.16em]
                                                    text-[var(--color-text-light)]
                                                "
                                            >
                                                Email *
                                            </span>

                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                className="
                                                    w-full
                                                    border-b
                                                    border-[var(--color-divider)]
                                                    bg-transparent
                                                    px-0
                                                    py-3
                                                    text-sm
                                                    font-medium
                                                    text-[var(--color-heading)]
                                                    outline-none
                                                    transition
                                                    placeholder:text-[var(--color-text-light)]
                                                    focus:border-[var(--color-primary)]
                                                "
                                            />
                                        </label>


                                        {/* PHONE */}

                                        <label className="block">
                                            <span
                                                className="
                                                    mb-2
                                                    block
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.16em]
                                                    text-[var(--color-text-light)]
                                                "
                                            >
                                                Phone *
                                            </span>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 98765 43210"
                                                autoComplete="tel"
                                                inputMode="tel"
                                                className="
                                                    w-full
                                                    border-b
                                                    border-[var(--color-divider)]
                                                    bg-transparent
                                                    px-0
                                                    py-3
                                                    text-sm
                                                    font-medium
                                                    text-[var(--color-heading)]
                                                    outline-none
                                                    transition
                                                    placeholder:text-[var(--color-text-light)]
                                                    focus:border-[var(--color-primary)]
                                                "
                                            />
                                        </label>


                                        {/* SERVICE */}

                                        <label className="relative block">
                                            <span
                                                className="
                                                    mb-2
                                                    block
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.16em]
                                                    text-[var(--color-text-light)]
                                                "
                                            >
                                                Service *
                                            </span>

                                            <select
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="
                                                    w-full
                                                    appearance-none
                                                    border-b
                                                    border-[var(--color-divider)]
                                                    bg-transparent
                                                    px-0
                                                    py-3
                                                    pr-8
                                                    text-sm
                                                    font-medium
                                                    text-[var(--color-heading)]
                                                    outline-none
                                                    transition
                                                    focus:border-[var(--color-primary)]
                                                "
                                            >
                                                <option value="">
                                                    Select service
                                                </option>

                                                {serviceOptions.map(
                                                    (service) => (
                                                        <option
                                                            key={service}
                                                            value={service}
                                                        >
                                                            {service}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <ChevronDown
                                                size={16}
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    right-0
                                                    bottom-3
                                                    text-[var(--color-text-light)]
                                                "
                                            />
                                        </label>


                                        {/* MESSAGE */}

                                        <label className="block sm:col-span-2">
                                            <span
                                                className="
                                                    mb-2
                                                    block
                                                    text-[9px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.16em]
                                                    text-[var(--color-text-light)]
                                                "
                                            >
                                                Message
                                            </span>

                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Tell us about your car..."
                                                rows={4}
                                                className="
                                                    w-full
                                                    resize-none
                                                    border-b
                                                    border-[var(--color-divider)]
                                                    bg-transparent
                                                    px-0
                                                    py-3
                                                    text-sm
                                                    font-medium
                                                    leading-7
                                                    text-[var(--color-heading)]
                                                    outline-none
                                                    transition
                                                    placeholder:text-[var(--color-text-light)]
                                                    focus:border-[var(--color-primary)]
                                                "
                                            />
                                        </label>
                                    </div>


                                    {/* ERROR */}

                                    {error && (
                                        <div
                                            className="
                                                mt-5
                                                bg-[var(--color-primary-light)]
                                                px-4
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-[var(--color-primary-hover)]
                                            "
                                        >
                                            {error}
                                        </div>
                                    )}


                                    {/* =================================================
                                        WHATSAPP SUBMIT
                                    ================================================= */}

                                    <button
                                        type="submit"
                                        disabled={
                                            status === "loading"
                                        }
                                        className="
                                            group
                                            mt-8
                                            inline-flex
                                            w-full
                                            items-center
                                            justify-center
                                            gap-3
                                            bg-[#25D366]
                                            px-6
                                            py-4
                                            text-sm
                                            font-bold
                                            text-white
                                            transition-all
                                            duration-300
                                            hover:-translate-y-0.5
                                            hover:bg-[#1ebe5d]
                                            hover:shadow-[0_10px_30px_rgba(37,211,102,0.20)]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                            sm:w-auto
                                            sm:min-w-[230px]
                                        "
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />

                                                Opening WhatsApp...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle
                                                    size={18}
                                                />

                                                Request on WhatsApp

                                                <Send
                                                    size={16}
                                                    className="
                                                        transition-transform
                                                        duration-300
                                                        group-hover:translate-x-1
                                                    "
                                                />
                                            </>
                                        )}
                                    </button>


                                    {/* INFO */}

                                    <div
                                        className="
                                            mt-7
                                            flex
                                            items-start
                                            gap-2
                                            text-[10px]
                                            leading-5
                                            text-[var(--color-text-light)]
                                            sm:text-xs
                                        "
                                    >
                                        <MapPin
                                            size={14}
                                            className="
                                                mt-0.5
                                                shrink-0
                                                text-[var(--color-primary)]
                                            "
                                        />

                                        <span>
                                            Your details will be
                                            formatted and opened in
                                            WhatsApp for quick booking
                                            confirmation.
                                        </span>
                                    </div>

                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;