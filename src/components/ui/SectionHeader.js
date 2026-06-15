export default function SectionHeader({ title }) {
    return (
        <div className="flex items-center space-x-2 border-b-2 border-primary pb-2 mb-6">
            <span className="w-1 h-4 bg-primary block"></span>
            <h2 className="text-xl font-bold uppercase text-text-light dark:text-white font-display">{title}</h2>
        </div>
    );
}
