const BRANDS = [
    {
        name: "BMW",
        logo: "https://cdn.simpleicons.org/bmw/8B949B",
    },
    {
        name: "Audi",
        logo: "https://cdn.simpleicons.org/audi/8B949B",
    },
    {
        name: "Volkswagen",
        logo: "https://cdn.simpleicons.org/volkswagen/8B949B",
    },
    {
        name: "Honda",
        logo: "https://cdn.simpleicons.org/honda/8B949B",
    },
    {
        name: "Tata Motors",
        logo: "https://cdn.simpleicons.org/tata/8B949B",
    },
    {
        name: "Mahindra",
        logo: "https://cdn.simpleicons.org/mahindra/8B949B",
    },
    {
        name: "Hyundai",
        logo: "https://cdn.simpleicons.org/hyundai/8B949B",
    },
];

const MARQUEE_BRANDS = [...BRANDS, ...BRANDS];

export default function Model() {
    return (
        <section
            className="
                relative
                w-full
                overflow-hidden
                bg-[var(--color-page-bg)]
                py-8
                sm:py-10
                lg:py-12
            "
        >
            {/* Soft edge fade */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    left-0
                    z-10
                    w-16
                    bg-gradient-to-r
                    from-[var(--color-page-bg)]
                    to-transparent
                    sm:w-24
                    lg:w-36
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    right-0
                    z-10
                    w-16
                    bg-gradient-to-l
                    from-[var(--color-page-bg)]
                    to-transparent
                    sm:w-24
                    lg:w-36
                "
            />

            {/* Slow marquee */}
            <div className="model-marquee flex w-max items-center">
                {MARQUEE_BRANDS.map((brand, index) => (
                    <div
                        key={`${brand.name}-${index}`}
                        className="
                            flex
                            h-16
                            w-[140px]
                            shrink-0
                            items-center
                            justify-center
                            px-6
                            sm:h-20
                            sm:w-[180px]
                            sm:px-8
                            lg:h-24
                            lg:w-[220px]
                        "
                    >
                        <img
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            width={140}
                            height={40}
                            loading="lazy"
                            className="
                                max-h-7
                                max-w-[105px]
                                object-contain
                                opacity-30
                                grayscale
                                transition-all
                                duration-700
                                hover:scale-105
                                hover:opacity-70
                                hover:grayscale-0
                                sm:max-h-8
                                sm:max-w-[125px]
                                lg:max-h-9
                                lg:max-w-[145px]
                            "
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}