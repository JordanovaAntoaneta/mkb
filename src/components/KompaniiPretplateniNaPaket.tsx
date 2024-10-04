import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Typography } from "@mui/material";
import { ChartOptions } from "chart.js";
import { KompaniiPretplateniNaPaketInterface } from "../interfaces/KompaniiPretplateniNaPaketInterface";
import { Link } from "./LinkBase";

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

const transformData = (data: KompaniiPretplateniNaPaketInterface[]) => {
    const packetsCount = data.reduce((accumulator, item) => {
        let packageName = item.nazivPaket;
        const daliPretplaten = item.isPretplatenNaPaket;

        if (packageName === 'Пакет за Шпаркасе Банка Македонија') {
            packageName = `Пакет за Шпаркасе\nБанка Македонија`;
        }

        if (daliPretplaten === 'YES') {
            if (!accumulator[packageName]) {
                accumulator[packageName] = 0;
            }

            accumulator[packageName] += 1;
        }

        return accumulator;
    }, {} as { [packageName: string]: number });

    return packetsCount;
};

function findSecondUpper(str: string) {
    let res: any;
    let flag = true;
    let alphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Ѓ', 'Е', 'Ж', 'З', 'Ѕ', 'И', 'Ј', 'К', 'Л', 'Љ', 'М', 'Н', 'Њ', 'О', 'П', 'Р', 'С', 'Т', 'Ќ', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Џ', 'Ш'];
    for (var i = 0; i < str.length; ++i) {
        if (flag === true) {
            flag = false;
        } else {
            if (alphabet.includes(str[i])) {
                res = i;
                break;
            }
        }
    }
    return res;
}

const KompaniiPretplateniNaPaket: React.FC = () => {
    const [data, setData] = useState<KompaniiPretplateniNaPaketInterface[]>([]);
    const [filteredData, setFilteredData] = useState<KompaniiPretplateniNaPaketInterface[]>([]);

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/KompaniiPretplateniNaPaket`, {
            method: "get",
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "ngrok-skip-browser-warning": "69420",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received content is not JSON");
                }
                return response.json();
            })
            .then((data: KompaniiPretplateniNaPaketInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const transformedData = transformData(filteredData);

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let companies: string[] = [];
                        data.forEach((item: KompaniiPretplateniNaPaketInterface) => {
                            if (item.nazivPaket === context.label) {
                                let name = item.companyName;
                                if (name.length > 40) {
                                    let indeks = findSecondUpper(name);
                                    let res = '...' + name.substring(indeks, indeks + 30) + '...';
                                    companies.push(res);
                                } else {
                                    companies.push(item.companyName);
                                }
                            }
                        });
                        const lines: string[] = [
                            'На овој пакет се претплатени следните компании:',
                            ...companies,
                            `Број на претплати: ${context.parsed.y}`,
                        ];

                        return lines;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Број на претплати',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Пакети',
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                        size: 12
                    }
                },
            },
        },
        layout: {
            padding: {
                bottom: 0,
            },
        },
    };

    const chartData = {
        labels: Object.keys(transformedData).map((key) => key.trim()),
        datasets: [
            {
                data: Object.values(transformedData).map((value) => value),
                backgroundColor: 'rgb(41, 176, 190)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Компании претплатени на пакет</Typography>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
}

export default KompaniiPretplateniNaPaket;
