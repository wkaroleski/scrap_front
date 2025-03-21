package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// PokemonDetails representa os detalhes do Pokémon da PokeAPI
type PokemonDetails struct {
	ID            int               `json:"id"`
	Name          string            `json:"name"`
	Stats         map[string]int    `json:"stats"`
	TotalBaseStats int               `json:"total_base_stats"`
	Types        string          `json:"types"`
	Image         string            `json:"image"`
	ShinyImage    string            `json:"shiny_image"`
}

// normalizePokemonName normaliza o nome do Pokémon para a API
func normalizePokemonName(name string) string {
	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, "'", "")
	name = strings.ReplaceAll(name, " ", "-")
	return name
}

// fetchPokemonDetails busca os detalhes do Pokémon na PokeAPI
func fetchPokemonDetails(pokemonID int) (*PokemonDetails, error) {
	url := fmt.Sprintf("https://pokeapi.co/api/v2/pokemon/%d", pokemonID)
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Erro ao fazer a requisição para a PokeAPI (ID %d): %v", pokemonID, err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Erro na resposta da PokeAPI (ID %d): Status Code %d", pokemonID, resp.StatusCode)
		return nil, fmt.Errorf("status code: %d", resp.StatusCode)
	}

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Printf("Erro ao decodificar a resposta da PokeAPI (ID %d): %v", pokemonID, err)
		return nil, err
	}

	details := &PokemonDetails{
		ID:    int(data["id"].(float64)),
		Name:  data["name"].(string),
		Stats: make(map[string]int),
		Types: make(string, 0),
	}

	totalBaseStats := 0
	for _, statEntry := range data["stats"].(interface{}) {
		stat := statEntry.(map[string]interface{})
		statName := stat["stat"].(map[string]interface{})["name"].(string)
		baseStat := int(stat["base_stat"].(float64))
		details.Stats[statName] = baseStat
		totalBaseStats += baseStat
	}
	details.TotalBaseStats = totalBaseStats

	for _, typeEntry := range data["types"].(interface{}) {
		typeName := typeEntry.(map[string]interface{})["type"].(map[string]interface{})["name"].(string)
		details.Types = append(details.Types, typeName)
	}

	sprites := data["sprites"].(map[string]interface{})
	details.Image = sprites["front_default"].(string)
	details.ShinyImage = sprites["front_shiny"].(string)

	return details, nil
}

// scrapePokemon faz o scraping da página e coleta os Pokémon
func scrapePokemon(canal string, usuario string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://grynsoft.com/spos-app/?c=%s&u=%s", url.QueryEscape(canal), url.QueryEscape(usuario))
	log.Printf("Scraping URL: %s", url)

	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Erro ao acessar a página de scraping: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Erro ao acessar a página de scraping: Status Code %d", resp.StatusCode)
		return nil, fmt.Errorf("status code: %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Printf("Erro ao parsear o HTML da página: %v", err)
		return nil, err
	}

	pokemons := make(map[string]interface{}, 0)
	seenIDs := make(map[string]bool)

	doc.Find(".Pokemon:not(#unobtained)").Each(func(i int, s *goquery.Selection) {
		indexElement := s.Find(".Index").First()
		if indexElement.Length() == 0 {
			return
		}
		pokemonIDStr := strings.ReplaceAll(strings.TrimSpace(indexElement.Text()), "#", "")
		pokemonID, err := strconv.Atoi(pokemonIDStr)
		if err != nil {
			log.Printf("Erro ao converter ID do Pokémon: %v", err)
			return
		}
		pokemonIDStr = strconv.Itoa(pokemonID) // Remove zeros à esquerda

		if seenIDs[pokemonIDStr] {
			return
		}
		seenIDs[pokemonIDStr] = true

		nameElement := s.Find("b").First()
		name := strings.TrimSpace(nameElement.Text())

		_, shiny := s.Attr("id")

		apiData, err := fetchPokemonDetails(pokemonID)
		pokemon := map[string]interface{}{
			"id":    pokemonIDStr,
			"name":  name,
			"shiny": shiny,
		}

		if err == nil && apiData != nil {
			pokemon["stats"] = apiData.Stats
			pokemon["total_base_stats"] = apiData.TotalBaseStats
			pokemon["types"] = apiData.Types
			if shiny {
				pokemon["image"] = apiData.ShinyImage
			} else {
				pokemon["image"] = apiData.Image
			}
		} else {
			log.Printf("Erro ao obter detalhes da API para o Pokémon ID %d: %v", pokemonID, err)
			pokemon["stats"] = nil
			pokemon["total_base_stats"] = nil
			pokemon["types"] = nil
			pokemon["image"] = nil
		}
		pokemons = append(pokemons, pokemon)
		time.Sleep(500 * time.Millisecond) // Adiciona um atraso para evitar rate limiting
	})

	log.Printf("Pokémon coletados (sem repetição): %d", len(pokemons))
	return pokemons, nil
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	canal := request.QueryStringParameters["canal"]
	usuario := request.QueryStringParameters["usuario"]

	if canal == "" || usuario == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       `{"error": "Por favor, forneça 'canal' e 'usuario' como parâmetros na URL."}`,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
		}, nil
	}

	pokemons, err := scrapePokemon(canal, usuario)
	if err != nil {
		log.Printf("Erro ao fazer o scraping: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       fmt.Sprintf(`{"error": "Erro ao processar a requisição: %v"}`, err),
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
		}, nil
	}

	responseJSON, err := json.Marshal(pokemons)
	if err != nil {
		log.Printf("Erro ao serializar a resposta JSON: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       `{"error": "Erro ao serializar os dados."}`,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(responseJSON),
		Headers: map[string]string{
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600", // Cache do navegador por 1 hora (3600 segundos)
		},
	}, nil
}

func main() {
	lambda.Start(handler)
}