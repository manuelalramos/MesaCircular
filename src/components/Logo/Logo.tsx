import { Link } from 'react-router-dom';

export default function Logo({ claro = false }: { claro?: boolean }) {
    return (
        <Link
            to="/"
            aria-label="Mesa Circular, início"
            className="logo-link inline-flex shrink-0 items-center"
        >
            <img
                src={claro ? '/logo_footer.png' : '/logo.png'}
                alt="Mesa Circular"
                width={900}
                height={370}
                className={claro ? 'h-auto w-44 max-w-full' : 'h-auto w-32 sm:w-36'}
            />
        </Link>
    );
}