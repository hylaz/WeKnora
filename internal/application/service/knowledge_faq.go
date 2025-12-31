package service

import (
	"context"
	"github.com/Tencent/WeKnora/internal/logger"
	"github.com/Tencent/WeKnora/internal/types"
	secutils "github.com/Tencent/WeKnora/internal/utils"
	"slices"
)

// SearchFAQEntries searches FAQ entries using hybrid search.
// 知识库搜索
func (s *knowledgeService) SearchFAQEntries(ctx context.Context,
	kbID string, req *types.FAQSearchRequest,
) ([]*types.FAQEntry, error) {
	// Validate FAQ knowledge base
	kb, err := s.validateFAQKnowledgeBase(ctx, kbID)
	if err != nil {
		return nil, err
	}

	// Set default values
	if req.VectorThreshold <= 0 {
		req.VectorThreshold = 0.7
	}
	if req.MatchCount <= 0 {
		req.MatchCount = 10
	}
	if req.MatchCount > 50 {
		req.MatchCount = 50
	}

	// Prepare search parameters
	searchParams := types.SearchParams{
		QueryText:            secutils.SanitizeForLog(req.QueryText),
		VectorThreshold:      req.VectorThreshold,
		MatchCount:           req.MatchCount,
		DisableKeywordsMatch: true,
	}

	// Call HybridSearch
	searchResults, err := s.kbService.HybridSearch(ctx, kbID, searchParams)
	if err != nil {
		return nil, err
	}

	if len(searchResults) == 0 {
		return []*types.FAQEntry{}, nil
	}

	// Extract chunk IDs and build score/match type maps
	chunkIDs := make([]string, 0, len(searchResults))
	chunkScores := make(map[string]float64)
	chunkMatchTypes := make(map[string]types.MatchType)
	for _, result := range searchResults {
		// SearchResult.ID is the chunk ID
		chunkID := result.ID
		chunkIDs = append(chunkIDs, chunkID)
		chunkScores[chunkID] = result.Score
		chunkMatchTypes[chunkID] = result.MatchType
	}

	// Batch fetch chunks
	tenantID := ctx.Value(types.TenantIDContextKey).(uint64)
	chunks, err := s.chunkRepo.ListChunksByID(ctx, tenantID, chunkIDs)
	if err != nil {
		return nil, err
	}

	// Filter FAQ chunks and convert to FAQEntry
	kb.EnsureDefaults()
	entries := make([]*types.FAQEntry, 0, len(chunks))
	for _, chunk := range chunks {

		// Only process FAQ type chunks
		if chunk.ChunkType != types.ChunkTypeFAQ {
			continue
		}
		if !chunk.IsEnabled {
			continue
		}

		entry, err := s.chunkToFAQEntry(chunk, kb)
		if err != nil {
			logger.Warnf(ctx, "Failed to convert chunk to FAQ entry: %v", err)
			continue
		}

		// Preserve score and match type from search results
		// Note: Negative question filtering is now handled in HybridSearch
		if score, ok := chunkScores[chunk.ID]; ok {
			entry.Score = score
		}
		if matchType, ok := chunkMatchTypes[chunk.ID]; ok {
			entry.MatchType = matchType
		}

		entries = append(entries, entry)
	}

	slices.SortFunc(entries, func(a, b *types.FAQEntry) int {
		return int(b.Score - a.Score)
	})

	return entries, nil
}
