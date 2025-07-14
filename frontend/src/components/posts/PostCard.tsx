import { Calendar, User, Tag, Eye, EyeOff } from "lucide-react";
import { Post } from "@/lib/queries/posts";
import Link from "next/link";

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const truncateContent = (content: string | null, maxLength: number = 150) => {
        if (!content) return "";
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    };

    return (
        <Link href={`/blog/${post.id}`} className="block">
            <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-pointer">
                {/* Status badge */}
                <div className="px-6 pt-6 pb-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {post.published ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <Eye className="w-3 h-3" />
                                    Publicado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    <EyeOff className="w-3 h-3" />
                                    Rascunho
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Post content */}
                <div className="px-6 pb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                    </h3>

                    {post.content && (
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            {truncateContent(post.content)}
                        </p>
                    )}

                    {/* Categories - only show if available */}
                    {post.categories && post.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.categories.map((postCategory) => (
                                <span
                                    key={postCategory.category.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"
                                >
                                    <Tag className="w-3 h-3" />
                                    {postCategory.category.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                                <Tag className="w-3 h-3" />
                                Sem categorias
                            </span>
                        </div>
                    )}

                    {/* Author */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {post.author?.name || 'Autor Anônimo'}
                            </p>
                            <p className="text-xs text-gray-500">{post.author?.email || 'Email não disponível'}</p>
                        </div>
                    </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
        </Link>
    );
} 