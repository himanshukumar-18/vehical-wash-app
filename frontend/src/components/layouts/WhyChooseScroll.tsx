"use client";

const items = [
    "WHY CHOOSE US",
    "WHY CHOOSE US",
    "WHY CHOOSE US",
    "WHY CHOOSE US",
];

const WhyChooseScroll = () => {
    return (
        <section
            className="
                relative
                overflow-hidden
                bg-[var(--color-section-bg)]
                py-8
                sm:py-10
                lg:py-12
            "
        >
            {/* Left fade */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    left-0
                    z-10
                    w-16
                    bg-gradient-to-r
                    from-[var(--color-section-bg)]
                    to-transparent
                    sm:w-24
                    lg:w-40
                "
            />

            {/* Right fade */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    right-0
                    z-10
                    w-16
                    bg-gradient-to-l
                    from-[var(--color-section-bg)]
                    to-transparent
                    sm:w-24
                    lg:w-40
                "
            />

            {/* Marquee */}
            <div className="why-scroll-track flex w-max items-center">
                {items.map((item, index) => (
                    <div
                        key={`${item}-${index}`}
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-7
                            pr-7
                            sm:gap-10
                            sm:pr-10
                            lg:gap-14
                            lg:pr-14
                        "
                    >
                        <span
                            className="
                                h-2
                                w-2
                                shrink-0
                                rounded-full
                                bg-[var(--color-primary)]
                                sm:h-2.5
                                sm:w-2.5
                            "
                        />

                        <span
                            className="
                                whitespace-nowrap
                                font-heading
                                text-[2.5rem]
                                font-semibold
                                uppercase
                                leading-none
                                tracking-[-0.045em]
                                text-[var(--color-heading)]
                                sm:text-[4rem]
                                md:text-[5rem]
                                lg:text-[6rem]
                                xl:text-[7rem]
                            "
                        >
                            {item}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyChooseScroll;