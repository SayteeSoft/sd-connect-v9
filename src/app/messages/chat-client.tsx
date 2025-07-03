
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Conversation, Message, Profile } from '@/lib/data';
import { saveMessage } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Paperclip,
  Smile,
  SendHorizonal,
  MoreVertical,
  Phone,
  Video,
  Heart,
  Ban,
  Trash2,
  Coins,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, isToday, isYesterday } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { triggerCreditMessage } from './actions';
import type { CreditMessageOutput } from '@/ai/flows/credit-message-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFavorites, useBlocked } from '@/hooks/use-user-lists';

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, 'p'); // e.g., 4:30 PM
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d'); // e.g., Jun 28
};

interface ChatClientProps {
  initialConversations: Conversation[];
  currentUser: Profile;
  initialSelectedProfileId?: number;
}

export function ChatClient({ initialConversations, currentUser, initialSelectedProfileId }: ChatClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user: loggedInUser, credits, spendCredits } = useAuth();
  
  const { list: favoritedIds, toggleItem: toggleFavorite, isItemInList } = useFavorites();
  const { list: blockedIds, addItem: blockUser } = useBlocked();

  const findConversationIdByProfileId = (profileId?: number): number | null => {
    if (!profileId) return null;
    const conversation = initialConversations.find(
      (c) => c.participant.id === profileId
    );
    return conversation?.id || null;
  };
  
  const [conversations, setConversations] = useState(initialConversations);
  const [removedIds, setRemovedIds] = useState<number[]>([]); // For session-only hiding
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    findConversationIdByProfileId(initialSelectedProfileId) || initialConversations.find(c => !blockedIds.includes(c.participant.id))?.id || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync state with props, filtering out blocked/removed users
  useEffect(() => {
    const activeConversations = initialConversations.filter(c => 
        !blockedIds.includes(c.participant.id) && 
        !removedIds.includes(c.id)
    );
    setConversations(activeConversations);
    
    // If a new chat was opened, make sure it's selected
    const newChatId = findConversationIdByProfileId(initialSelectedProfileId);
    if (newChatId) {
        setSelectedConversationId(newChatId);
    } else if (selectedConversationId && !activeConversations.some(c => c.id === selectedConversationId)) {
        // If current selected chat is now blocked/removed, select the first available one
        setSelectedConversationId(activeConversations[0]?.id || null);
    }

  }, [initialConversations, blockedIds, removedIds, selectedConversationId, initialSelectedProfileId]);
  
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }
    return conversations.filter(convo =>
      convo.participant.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [conversations, searchTerm]);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !loggedInUser) return;

    const selectedConvo = conversations.find((c) => c.id === selectedConversationId);
    if (!selectedConvo) return;

    // Check for credits if the user is a daddy (and not the admin)
    if (loggedInUser.role === 'daddy' && loggedInUser.id !== 1 && credits <= 0) {
      router.push(`/purchase-credits?redirect=/messages&chatWith=${selectedConvo.participant.id}`);
      triggerCreditMessage({
        sugarDaddyName: loggedInUser.name,
        sugarBabyName: selectedConvo.participant.name,
      })
        .then(async (response: CreditMessageOutput) => {
          const aiMessage: Message = {
            id: Date.now(),
            senderId: selectedConvo.participant.id, // From the sugar baby
            text: response.message,
            timestamp: new Date().toISOString(),
          };
          // For AI messages in a new chat, we can't save them, just show them locally
          if (selectedConversationId > 0) {
            const success = await saveMessage(selectedConversationId, aiMessage);
            if (success) {
              setConversations((prev) =>
                prev.map((convo) =>
                  convo.id === selectedConversationId
                    ? {
                        ...convo,
                        messages: [...convo.messages, aiMessage],
                      }
                    : convo
                )
              );
            }
          }
        })
        .catch((err) => {
          console.error('Failed to generate AI credit message:', err);
        });

      setNewMessage('');
      return;
    }

    const message: Message = {
      id: Date.now(),
      senderId: currentUser.id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    setConversations((prev) =>
      prev.map((convo) =>
        convo.id === selectedConversationId
          ? { ...convo, messages: [...convo.messages, message] }
          : convo
      )
    );
    setNewMessage('');

    // If it's a new conversation (ID is negative), don't try to save to backend.
    if (selectedConversationId < 0) {
        return;
    }

    try {
      // First, save the message to the server
      const success = await saveMessage(selectedConversationId, message);
      if (!success) {
        throw new Error('Failed to save message to server.');
      }

      // If message saved successfully, then spend credits
      if (loggedInUser.role === 'daddy' && loggedInUser.id !== 1) {
        await spendCredits(1); // This will update the credits in the auth context
      }
    } catch (error) {
      console.error('Error sending message or spending credits:', error);
      
      // Revert the optimistic UI update on failure
      setConversations((prev) =>
        prev.map((convo) =>
          convo.id === selectedConversationId
            ? {
                ...convo,
                messages: convo.messages.filter((m) => m.id !== message.id),
              }
            : convo
        )
      );
      
      // Restore the unsent message to the input box
      setNewMessage(message.text);

      toast({
        variant: 'destructive',
        title: 'Message Not Sent',
        description: 'There was an error. Please try again.',
      });
    }
  };

  const handleFavorite = (profile: Profile) => {
    const isCurrentlyFavorited = isItemInList(profile.id);
    toggleFavorite(profile.id);
    toast({
      title: isCurrentlyFavorited ? 'Removed from Favorites' : 'Added to Favorites',
      description: `${profile.name} has been ${isCurrentlyFavorited ? 'removed from your' : 'added to your'} favorites list.`,
    });
  };

  const handleDeleteChat = () => {
    if (!selectedConversationId) return;
    const convoToDelete = conversations.find(c => c.id === selectedConversationId);
    if (!convoToDelete) return;
    
    // Add to session-only removed list
    setRemovedIds(prev => [...prev, selectedConversationId]);
    
    toast({
      title: 'Chat Deleted',
      description: `Your conversation with ${convoToDelete.participant.name} has been deleted for this session.`,
      variant: 'destructive',
    });
  };

  const handleBlockUser = () => {
    if (!selectedConversation) return;
    const profileToBlock = selectedConversation.participant;
    
    // Persistently block the user
    blockUser(profileToBlock.id);
    
    toast({
      title: 'User Blocked',
      description: `You have blocked ${profileToBlock.name}. You will no longer see them.`,
      variant: 'destructive',
    });
  };

  const isCurrentlyFavorited = selectedConversation ? isItemInList(selectedConversation.participant.id) : false;

  return (
    <div className="flex h-full w-full bg-background">
      {/* Left Pane: Conversation List */}
      <aside className="w-full md:w-1/3 lg:w-1/4 h-full flex flex-col border-r">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  'flex items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedConversationId === convo.id && 'bg-muted'
                )}
                onClick={() => setSelectedConversationId(convo.id)}
              >
                <Avatar className="h-12 w-12 mr-3 relative">
                  <AvatarImage src={convo.participant.imageUrl ?? 'https://placehold.co/100x100.png'} alt={convo.participant.name} data-ai-hint={convo.participant.hint} />
                  <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
                  {convo.participant.online && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </Avatar>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{convo.participant.name}</h3>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {isClient && convo.messages.length > 0 ? formatTimestamp(convo.messages[convo.messages.length - 1].timestamp) : null}
                    </p>
                  </div>
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.messages.length > 0 ? convo.messages[convo.messages.length - 1].text : <i>No messages yet</i>}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 text-xs bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center rounded-full font-medium">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No conversations found.</p>
          )}
        </ScrollArea>
      </aside>

      {/* Right Pane: Chat Window */}
      <section className="hidden md:flex flex-col flex-grow h-full">
        {selectedConversation ? (
          <>
            <header className="flex items-center p-3 border-b shadow-sm">
              <Avatar className="h-10 w-10 mr-3 relative">
                <AvatarImage
                  src={selectedConversation.participant.imageUrl ?? 'https://placehold.co/100x100.png'}
                  alt={selectedConversation.participant.name}
                  data-ai-hint={selectedConversation.participant.hint}
                />
                <AvatarFallback>
                  {selectedConversation.participant.name.charAt(0)}
                </AvatarFallback>
                 {selectedConversation.participant.online && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                )}
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">{selectedConversation.participant.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.participant.online ? 'Online' : `Last seen ${isClient ? formatTimestamp(new Date(Date.now() - 1000 * 60 * 15).toISOString()) : 'recently'}`}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon"><Phone /></Button></TooltipTrigger>
                    <TooltipContent><p>Voice Call</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon"><Video /></Button></TooltipTrigger>
                    <TooltipContent><p>Video Call</p></TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onSelect={() => handleFavorite(selectedConversation.participant)}>
                        <Heart className={cn("mr-2 h-4 w-4", isCurrentlyFavorited && "fill-pink-500 text-pink-500")} />
                        <span>{isCurrentlyFavorited ? 'Unfavorite' : 'Favorite'}</span>
                      </DropdownMenuItem>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Chat</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will hide your conversation with {selectedConversation.participant.name} for this session. It will reappear if you refresh the page.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <DropdownMenuSeparator />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Ban className="mr-2 h-4 w-4" />
                            <span>Block User</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to block this user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will no longer see messages or profile from {selectedConversation.participant.name}. This action is permanent.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBlockUser} className="bg-destructive hover:bg-destructive/90">
                                    Block
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </header>
            
            <div className="relative flex-grow overflow-auto">
                <ScrollArea
                    className={cn(
                        'h-[600px] bg-secondary/40',
                        loggedInUser?.role === 'daddy' &&
                        loggedInUser.id !== 1 &&
                        credits <= 0 &&
                        'blur-sm'
                    )}
                >
                    <div className="space-y-4 p-4">
                        {selectedConversation.messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex items-end gap-2',
                                    message.senderId === currentUser.id
                                        ? 'justify-end'
                                        : 'justify-start'
                                )}
                            >
                                {message.senderId !== currentUser.id && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={selectedConversation.participant.imageUrl ?? 'https://placehold.co/100x100.png'} alt={selectedConversation.participant.name} data-ai-hint={selectedConversation.participant.hint}/>
                                        <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'max-w-md rounded-xl px-4 py-2',
                                        message.senderId === currentUser.id
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-card text-card-foreground rounded-bl-none border'
                                    )}
                                >
                                    <p>{message.text}</p>
                                </div>
                                {message.senderId === currentUser.id && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={currentUser.imageUrl ?? 'https://placehold.co/100x100.png'} alt={currentUser.name} data-ai-hint={currentUser.hint}/>
                                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                {loggedInUser?.role === 'daddy' &&
                    loggedInUser.id !== 1 &&
                    credits <= 0 && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
                        <Ban className="mb-4 h-12 w-12 text-destructive" />
                        <h3 className="text-xl font-bold">You're out of credits!</h3>
                        <p className="mt-2 mb-6 text-muted-foreground">
                            Purchase more to continue your conversations and unlock
                            your messages.
                        </p>
                        <Button
                            onClick={() =>
                                router.push(
                                    `/purchase-credits?redirect=/messages&chatWith=${selectedConversation?.participant.id}`
                                )
                            }
                        >
                            <Coins className="mr-2 h-4 w-4" />
                            Buy Credits
                        </Button>
                    </div>
                )}
            </div>

            <footer className="p-3 border-t bg-background">
                <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
                  <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><Button type="button" variant="ghost" size="icon"><Paperclip /></Button></TooltipTrigger>
                        <TooltipContent><p>Attach File</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild><Button type="button" variant="ghost" size="icon"><Smile /></Button></TooltipTrigger>
                        <TooltipContent><p>Insert Emoji</p></TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={
                            loggedInUser?.role === 'daddy' && loggedInUser.id !== 1 && credits <= 0
                                ? "You're out of credits"
                                : 'Type your message...'
                        }
                        autoComplete="off"
                        className="flex-grow"
                        disabled={loggedInUser?.role === 'daddy' && loggedInUser.id !== 1 && credits <= 0}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || (loggedInUser?.role === 'daddy' && loggedInUser.id !== 1 && credits <= 0)}>
                        <SendHorizonal />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </section>
    </div>
  );
}
