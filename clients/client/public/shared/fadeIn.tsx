import {motion, useInView} from "motion/react";
import {useRef, type ReactNode} from "react";

type FadeInProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
};

function FadeIn({children, className, delay = 0}: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, {once: true, margin: "-80px"});

    return (
        <motion.div
            ref={ref}
            initial={{opacity: 0, y: 32}}
            animate={inView ? {opacity: 1, y: 0} : {opacity: 0, y: 32}}
            transition={{duration: 0.6, delay, ease: [0.22, 1, 0.36, 1]}}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default FadeIn;
