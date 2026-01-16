import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-navy-night border-t border-border/20 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Top section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                    {/* Left: Branding */}
                    <div>
                        <h3 className="text-gradient text-xl font-bold mb-2">Cadencea</h3>
                        <p className="text-muted-foreground text-sm">Your ultimate karaoke experience</p>
                    </div>

                    {/* Right: Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            to="/help"
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                        >
                            Help
                        </Link>
                        <Link
                            to="/faq"
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                        >
                            FAQ
                        </Link>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="border-t border-border/20 pt-6">
                    <p className="text-center text-muted-foreground text-sm">
                        © {currentYear} Cadencea. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
