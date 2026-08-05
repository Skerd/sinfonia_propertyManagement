import {Link} from "react-router-dom";
import {dyeusMenuLinks} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusRouteMap.ts";

function DyeusFooter() {
    return (
        <footer className="bg-dyeus-ink text-dyeus-cream">
            <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 md:py-24">
                <p className="font-dyeus-serif text-[18vw] leading-none tracking-[0.08em] text-dyeus-cream/95 md:text-[12vw]">
                    DYEUS
                </p>
                <div className="mt-10 flex flex-col gap-8 border-t border-white/15 pt-8 md:mt-14 md:flex-row md:items-start md:justify-between">
                    <nav className="flex flex-wrap gap-x-6 gap-y-3">
                        {dyeusMenuLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="font-dyeus-sans text-sm text-dyeus-cream/75 transition hover:text-dyeus-cream"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex flex-col gap-2 font-dyeus-sans text-sm text-dyeus-cream/55">
                        <p>Mediterranean coast · Albania</p>
                        <p>© {new Date().getFullYear()} Dyeus Residence</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default DyeusFooter;
