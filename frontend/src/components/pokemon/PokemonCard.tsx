import Image from "next/image";
import { Pokemon } from "../../lib/queries/pokemon";

interface PokemonCardProps {
    pokemon: Pokemon;
}

// Type colors mapping for visual appeal
const typeColors: { [key: string]: string } = {
    fire: "from-red-400 to-orange-500",
    water: "from-blue-400 to-cyan-500",
    grass: "from-green-400 to-emerald-500",
    electric: "from-yellow-400 to-amber-500",
    psychic: "from-purple-400 to-pink-500",
    ice: "from-cyan-300 to-blue-400",
    dragon: "from-indigo-500 to-purple-600",
    dark: "from-gray-700 to-gray-900",
    fighting: "from-red-600 to-orange-700",
    poison: "from-purple-500 to-violet-600",
    ground: "from-yellow-600 to-orange-600",
    flying: "from-indigo-300 to-sky-400",
    bug: "from-green-500 to-lime-600",
    rock: "from-yellow-700 to-orange-800",
    ghost: "from-purple-600 to-indigo-700",
    steel: "from-gray-400 to-slate-500",
    fairy: "from-pink-300 to-rose-400",
    normal: "from-gray-400 to-gray-600",
};

const getTypeGradient = (type: string) => {
    return typeColors[type.toLowerCase()] || "from-gray-400 to-gray-600";
};

export default function PokemonCard({ pokemon }: PokemonCardProps) {
    return (
        <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            {/* Type gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(pokemon.type)} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>

            {/* Card content */}
            <div className="relative p-6">
                {/* Pokemon Image */}
                <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 group-hover:scale-110 transition-transform duration-300">
                        <Image
                            src={pokemon.image}
                            alt={pokemon.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/128x128/f3f4f6/9ca3af?text=Pokemon";
                            }}
                        />
                    </div>
                </div>

                {/* Pokemon Info */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {pokemon.name}
                    </h3>

                    {/* Type Badge */}
                    <div className="inline-flex items-center mb-3">
                        <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${getTypeGradient(pokemon.type)} shadow-md`}>
                            {pokemon.type.charAt(0).toUpperCase() + pokemon.type.slice(1)}
                        </span>
                    </div>

                    {/* Ability */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Ability</p>
                        <p className="text-base font-medium text-gray-800 bg-gray-50 px-3 py-1 rounded-lg">
                            {pokemon.ability}
                        </p>
                    </div>

                    {/* ID Badge */}
                    <div className="flex justify-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            #{pokemon.id}
                        </span>
                    </div>
                </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
} 